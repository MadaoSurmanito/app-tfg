import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";

// Resuelve los IDs de catálogo necesarios para registrar el evento de logout
async function resolveLogoutCatalogIds() {
	const result = await pool.query(
		`
		SELECT 'event' AS kind, id
		FROM access_event_types
		WHERE code = 'logout'

		UNION ALL

		SELECT 'result' AS kind, id
		FROM access_result_types
		WHERE code = 'success'
		`,
	);

	const eventTypeId = result.rows.find((row) => row.kind === "event")?.id;
	const resultTypeId = result.rows.find((row) => row.kind === "result")?.id;

	if (!eventTypeId || !resultTypeId) {
		throw new Error("No se pudieron resolver los catálogos de logout");
	}

	return {
		eventTypeId,
		resultTypeId,
	};
}

// Endpoint para logout: revoca la sesión en BD y registra el evento correspondiente
export async function POST() {
	try {
		const session = await auth();

		// Si no hay sesión o no tenemos identificador interno de sesión, no hacemos nada grave
		if (!session?.accessSessionId) {
			return NextResponse.json({ ok: true });
		}

		const sessionToken = session.accessSessionId;
		const userId = session.user?.id ?? null;
		const email = session.user?.email ?? null;
		const now = new Date();

		const { eventTypeId, resultTypeId } = await resolveLogoutCatalogIds();

		// Revocamos la sesión en los registros existentes de esa sesión
		await pool.query(
			`
			UPDATE user_access_log
			SET revoked_at = $2
			WHERE session_token = $1
			  AND revoked_at IS NULL
			`,
			[sessionToken, now],
		);

		// Registramos explícitamente el evento de logout
		await pool.query(
			`
            INSERT INTO user_access_log (
                user_id,
                email_attempted,
                event_type_id,
                result_type_id,
                failure_reason,
                session_token,
                ip_address,
                user_agent,
                revoked_at,
                expires_at,
                created_at
            )
            VALUES ($1, $2, $3, $4, NULL, $5, NULL, NULL, $6, NULL, $6)
            `,
			[userId, email, eventTypeId, resultTypeId, sessionToken, now],
		);

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("[logout] error:", error);
		return NextResponse.json({ message: "Error en logout" }, { status: 500 });
	}
}

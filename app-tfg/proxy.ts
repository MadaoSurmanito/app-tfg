// Este archivo protege las rutas privadas y valida la sesión tanto en Auth.js como en BD

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

// Registra un evento de fin de sesión evitando duplicados innecesarios
async function registerSessionLifecycleEvent(params: {
	sessionToken: string;
	userId?: string | null;
	emailAttempted?: string | null;
	eventCode: "session_revoked" | "session_expired";
	resultCode: "revoked" | "expired";
	revokedAt?: Date | null;
	expiresAt?: Date | null;
	createdAt: Date;
}) {
	const existingEvent = await pool.query(
		`
		SELECT 1
		FROM user_access_log ual
		INNER JOIN access_event_types aet
			ON aet.id = ual.event_type_id
		WHERE ual.session_token = $1
		  AND aet.code IN ('logout', 'session_revoked', 'session_expired')
		LIMIT 1
		`,
		[params.sessionToken],
	);

	// Si ya existe un evento terminal de la sesión, no registramos otro
	if ((existingEvent.rowCount ?? 0) > 0) {
		return;
	}

	const catalogResult = await pool.query(
		`
		SELECT 'event' AS kind, id
		FROM access_event_types
		WHERE code = $1

		UNION ALL

		SELECT 'result' AS kind, id
		FROM access_result_types
		WHERE code = $2
		`,
		[params.eventCode, params.resultCode],
	);

	const eventTypeId = catalogResult.rows.find(
		(row) => row.kind === "event",
	)?.id;
	const resultTypeId = catalogResult.rows.find(
		(row) => row.kind === "result",
	)?.id;

	if (!eventTypeId || !resultTypeId) {
		throw new Error("No se pudieron resolver los catálogos de sesión");
	}

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
		VALUES ($1, $2, $3, $4, NULL, $5, NULL, NULL, $6, $7, $8)
		`,
		[
			params.userId ?? null,
			params.emailAttempted ?? null,
			eventTypeId,
			resultTypeId,
			params.sessionToken,
			params.revokedAt ?? null,
			params.expiresAt ?? null,
			params.createdAt,
		],
	);
}

export default auth(async (req) => {
	const { nextUrl } = req;
	const session = req.auth;

	const isLoggedIn = !!session?.user;
	const role = session?.user?.role;
	const accessSessionId = session?.accessSessionId;

	const pathname = nextUrl.pathname;

	const isAdminRoute = pathname.startsWith("/admin");
	const isCommercialRoute = pathname.startsWith("/comerciales");
	const isClientRoute = pathname.startsWith("/clientes");
	const isAuthRoute =
		pathname.startsWith("/login") || pathname.startsWith("/register");

	// No logeado, fuera de zonas privadas
	if (!isLoggedIn && (isAdminRoute || isCommercialRoute || isClientRoute)) {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	// Validación de sesión contra BD
	if (isLoggedIn && accessSessionId) {
		try {
			const result = await pool.query(
				`
				SELECT
					ual.user_id,
					ual.email_attempted,
					ual.revoked_at,
					ual.expires_at
				FROM user_access_log ual
				INNER JOIN access_event_types aet
					ON aet.id = ual.event_type_id
				WHERE ual.session_token = $1
				  AND aet.code = 'login_success'
				ORDER BY ual.created_at DESC
				LIMIT 1
				`,
				[accessSessionId],
			);

			const dbSession = result.rows[0];

			// Si no existe la sesión en BD, la tratamos como inválida
			if (!dbSession) {
				return NextResponse.redirect(new URL("/login", nextUrl));
			}

			const now = new Date();
			const revokedAt = dbSession.revoked_at
				? new Date(dbSession.revoked_at)
				: null;
			const expiresAt = dbSession.expires_at
				? new Date(dbSession.expires_at)
				: null;

			// Si la sesión fue revocada manualmente, registramos session_revoked una sola vez
			if (revokedAt !== null) {
				await registerSessionLifecycleEvent({
					sessionToken: accessSessionId,
					userId: dbSession.user_id,
					emailAttempted: dbSession.email_attempted,
					eventCode: "session_revoked",
					resultCode: "revoked",
					revokedAt,
					expiresAt,
					createdAt: revokedAt,
				});

				return NextResponse.redirect(new URL("/login", nextUrl));
			}

			// Si la sesión ha caducado, registramos session_expired una sola vez y marcamos revoked_at
			if (expiresAt && expiresAt < now) {
				await pool.query(
					`
					UPDATE user_access_log
					SET revoked_at = $2
					WHERE session_token = $1
					  AND revoked_at IS NULL
					`,
					[accessSessionId, now],
				);

				await registerSessionLifecycleEvent({
					sessionToken: accessSessionId,
					userId: dbSession.user_id,
					emailAttempted: dbSession.email_attempted,
					eventCode: "session_expired",
					resultCode: "expired",
					revokedAt: now,
					expiresAt,
					createdAt: now,
				});

				return NextResponse.redirect(new URL("/login", nextUrl));
			}
		} catch (error) {
			console.error("[proxy] error validando sesión:", error);
			return NextResponse.redirect(new URL("/login", nextUrl));
		}
	}

	// Ya logeado, no volver a login/register
	if (isLoggedIn && isAuthRoute) {
		if (role === "admin") {
			return NextResponse.redirect(new URL("/admin", nextUrl));
		}
		if (role === "commercial") {
			return NextResponse.redirect(new URL("/comerciales", nextUrl));
		}
		if (role === "client") {
			return NextResponse.redirect(new URL("/clientes", nextUrl));
		}
	}

	// Protección por rol
	if (isAdminRoute && role !== "admin") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	if (isCommercialRoute && role !== "commercial") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	if (isClientRoute && role !== "client") {
		return NextResponse.redirect(new URL("/login", nextUrl));
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		"/admin/:path*",
		"/comerciales/:path*",
		"/clientes/:path*",
		"/login",
		"/register",
	],
};

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// Ruta para aprobar una solicitud
export async function POST(request: Request, { params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const { id } = await params;
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// Bloquear la solicitud para revisión
		const requestResult = await client.query(
			`
				SELECT
					ur.id,
					ur.name,
					ur.email,
					ur.company,
					ur.phone,
					ur.password_hash,
					ur.requested_role_id,
					rs.code AS status_code
				FROM user_requests ur
				INNER JOIN request_statuses rs
					ON rs.id = ur.status_id
				WHERE ur.id = $1
				FOR UPDATE
			`,
			[id],
		);

		const solicitud = requestResult.rows[0];

		if (!solicitud) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL("/admin/users/solicitudes?error=no-encontrada", request.url),
			);
		}

		if (solicitud.status_code !== "pending") {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL("/admin/users/solicitudes?error=ya-revisada", request.url),
			);
		}

		// Comprobar si ya existe usuario con ese correo
		const existingUser = await client.query(
			`
				SELECT id
				FROM users
				WHERE lower(email) = lower($1)
				LIMIT 1
			`,
			[solicitud.email],
		);

		if ((existingUser.rowCount ?? 0) > 0) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL("/admin/users/solicitudes?error=usuario-existe", request.url),
			);
		}

		// Resolver el estado activo
		const activeStatusResult = await client.query(
			`
				SELECT id
				FROM user_statuses
				WHERE code = 'active'
				LIMIT 1
			`,
		);

		const activeStatusId = activeStatusResult.rows[0]?.id;

		if (!activeStatusId) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL("/admin/users/solicitudes?error=server", request.url),
			);
		}

		// Crear el usuario definitivo
		const insertUserResult = await client.query<{ id: string }>(
			`
				INSERT INTO users (
					name,
					email,
					company,
					phone,
					password_hash,
					role_id,
					status_id,
					profile_image_url,
					last_login_at,
					created_at,
					updated_at
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NULL, NOW(), NOW())
				RETURNING id
			`,
			[
				solicitud.name,
				solicitud.email,
				solicitud.company,
				solicitud.phone,
				solicitud.password_hash,
				solicitud.requested_role_id,
				activeStatusId,
			],
		);

		const newUserId = insertUserResult.rows[0].id;

		// Resolver el estado aprobada
		const approvedStatusResult = await client.query(
			`
				SELECT id
				FROM request_statuses
				WHERE code = 'approved'
				LIMIT 1
			`,
		);

		const approvedStatusId = approvedStatusResult.rows[0]?.id;

		if (!approvedStatusId) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL("/admin/users/solicitudes?error=server", request.url),
			);
		}

		// Marcar la solicitud como aprobada
		await client.query(
			`
				UPDATE user_requests
				SET
					status_id = $1,
					reviewed_at = NOW(),
					reviewed_by = $2,
					created_user_id = $3,
					rejection_reason = NULL
				WHERE id = $4
			`,
			[approvedStatusId, session.user.id, newUserId, id],
		);

		await client.query("COMMIT");

		return NextResponse.redirect(
			new URL("/admin/users/solicitudes?success=aprobada", request.url),
		);
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error al aprobar solicitud:", error);

		return NextResponse.redirect(
			new URL("/admin/users/solicitudes?error=server", request.url),
		);
	} finally {
		client.release();
	}
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";

type Props = {
	params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Props) {
	const session = await auth();

	if (!session || session.user.role !== "admin") {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 });
	}

	const { id } = await params;
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const targetUserResult = await client.query(
			`
				SELECT
					u.id,
					u.email,
					u.role_id,
					u.status_id,
					s.code AS status_code
				FROM users u
				INNER JOIN user_statuses s
					ON s.id = u.status_id
				WHERE u.id = $1
			`,
			[id],
		);

		if (targetUserResult.rowCount === 0) {
			await client.query("ROLLBACK");
			return NextResponse.json(
				{ error: "Usuario no encontrado" },
				{ status: 404 },
			);
		}

		const targetUser = targetUserResult.rows[0] as {
			id: string;
			email: string;
			role_id: number;
			status_id: number;
			status_code: string;
		};

		if (session.user.id === targetUser.id) {
			await client.query("ROLLBACK");
			return NextResponse.json(
				{ error: "No puedes desactivar tu propio usuario" },
				{ status: 400 },
			);
		}

		if (targetUser.status_code === "inactive") {
			await client.query("COMMIT");
			return NextResponse.redirect(
				new URL(`/admin/users/usuarios/${id}`, request.url),
			);
		}

		const inactiveStatusResult = await client.query(
			`
				SELECT id
				FROM user_statuses
				WHERE code = 'inactive'
				LIMIT 1
			`,
		);

		if (inactiveStatusResult.rowCount === 0) {
			throw new Error("No existe el estado 'inactive' en user_statuses");
		}

		const deactivateActionResult = await client.query(
			`
				SELECT id
				FROM user_admin_action_types
				WHERE code = 'deactivate_user'
				LIMIT 1
			`,
		);

		if (deactivateActionResult.rowCount === 0) {
			throw new Error(
				"No existe la acción 'deactivate_user' en user_admin_action_types",
			);
		}

		const inactiveStatusId = inactiveStatusResult.rows[0].id as number;
		const deactivateActionTypeId = deactivateActionResult.rows[0].id as number;

		await client.query(
			`
				UPDATE users
				SET status_id = $2,
					updated_at = NOW()
				WHERE id = $1
			`,
			[id, inactiveStatusId],
		);

		await client.query(
			`
				INSERT INTO user_management_log (
					target_user_id,
					performed_by,
					action_type_id,
					previous_status_id,
					new_status_id,
					previous_role_id,
					new_role_id,
					reason,
					notes
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			`,
			[
				id,
				session.user.id,
				deactivateActionTypeId,
				targetUser.status_id,
				inactiveStatusId,
				targetUser.role_id,
				targetUser.role_id,
				"Desactivación manual desde administración de usuarios",
				`Usuario desactivado manualmente por ${session.user.email ?? "admin"}`,
			],
		);

		await client.query("COMMIT");

		return NextResponse.redirect(new URL("/admin/users/usuarios", request.url));
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error desactivando usuario:", error);

		return NextResponse.json(
			{ error: "Error al desactivar el usuario" },
			{ status: 500 },
		);
	} finally {
		client.release();
	}
}

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import { getPasswordValidationMessage } from "@/app/lib/password";

// Cambia la contraseña del usuario autenticado
export async function POST(request: Request) {
	const session = await auth();

	if (!session?.user) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const client = await pool.connect();

	try {
		const formData = await request.formData();

		const currentPassword = String(formData.get("current_password") ?? "");
		const newPassword = String(formData.get("new_password") ?? "");
		const confirmNewPassword = String(
			formData.get("confirm_new_password") ?? "",
		);

		if (!currentPassword || !newPassword || !confirmNewPassword) {
			return NextResponse.redirect(
				new URL("/profile/change-password?error=campos", request.url),
			);
		}

		if (newPassword !== confirmNewPassword) {
			return NextResponse.redirect(
				new URL("/profile/change-password?error=coincidencia", request.url),
			);
		}

		const passwordValidationMessage = getPasswordValidationMessage(newPassword);

		if (passwordValidationMessage) {
			return NextResponse.redirect(
				new URL("/profile/change-password?error=password", request.url),
			);
		}

		await client.query("BEGIN");

		const userResult = await client.query(
			`
			SELECT id, email, password_hash
			FROM users
			WHERE id = $1
			FOR UPDATE
			`,
			[session.user.id],
		);

		const user = userResult.rows[0];

		if (!user) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL("/profile/change-password?error=usuario", request.url),
			);
		}

		const validCurrentPassword = await bcrypt.compare(
			currentPassword,
			user.password_hash,
		);

		if (!validCurrentPassword) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL("/profile/change-password?error=actual", request.url),
			);
		}

		const newPasswordHash = await bcrypt.hash(newPassword, 10);

		await client.query(
			`
			UPDATE users
			SET
				password_hash = $1,
				updated_at = NOW()
			WHERE id = $2
			`,
			[newPasswordHash, session.user.id],
		);

		const actionTypeResult = await client.query(
			`
			SELECT id
			FROM user_admin_action_types
			WHERE code = 'password_reset'
			LIMIT 1
			`,
		);

		const actionTypeId = actionTypeResult.rows[0]?.id;

		if (actionTypeId) {
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
					notes,
					created_at
				)
				VALUES ($1, $2, $3, NULL, NULL, NULL, NULL, NULL, $4, NOW())
				`,
				[
					session.user.id,
					session.user.id,
					actionTypeId,
					"Cambio de contraseña realizado por el propio usuario",
				],
			);
		}

		// Revocar otras sesiones activas del usuario
		if (session.accessSessionId) {
			await client.query(
				`
				UPDATE user_access_log
				SET revoked_at = NOW()
				WHERE user_id = $1
				  AND session_token IS NOT NULL
				  AND session_token <> $2
				  AND revoked_at IS NULL
				`,
				[session.user.id, session.accessSessionId],
			);
		}

		await client.query("COMMIT");

		return NextResponse.redirect(
			new URL("/profile/change-password?success=1", request.url),
		);
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error en /api/account/change-password:", error);

		return NextResponse.redirect(
			new URL("/profile/change-password?error=server", request.url),
		);
	} finally {
		client.release();
	}
}

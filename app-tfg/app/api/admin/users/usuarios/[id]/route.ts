import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { getPasswordValidationMessage } from "@/app/lib/password";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

type CatalogRow = {
	id: number;
	code: string;
};

// Normaliza texto
function normalizeText(value: FormDataEntryValue | null) {
	return String(value ?? "").trim();
}

// Normaliza email
function normalizeEmail(value: FormDataEntryValue | null) {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

// Carga un usuario para edición
export async function GET(request: Request, { params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.json({ message: "No autorizado" }, { status: 403 });
	}

	const { id } = await params;

	try {
		const result = await pool.query(
			`
			SELECT
				u.id,
				u.name,
				u.email,
				u.company,
				u.phone,
				u.role_id,
				u.status_id,
				r.code AS role,
				us.code AS status,
				u.created_at,
				u.updated_at,
				u.last_login_at
			FROM users u
			INNER JOIN roles r
				ON r.id = u.role_id
			INNER JOIN user_statuses us
				ON us.id = u.status_id
			WHERE u.id = $1
			LIMIT 1
			`,
			[id],
		);

		const usuario = result.rows[0];

		if (!usuario) {
			return NextResponse.json(
				{ message: "Usuario no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json(usuario);
	} catch (error) {
		console.error("Error en GET /api/admin/users/usuarios/[id]:", error);
		return NextResponse.json(
			{ message: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

// Actualiza un usuario
export async function POST(request: Request, { params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const { id } = await params;
	const client = await pool.connect();

	try {
		const formData = await request.formData();

		const name = normalizeText(formData.get("name"));
		const email = normalizeEmail(formData.get("email"));
		const company = normalizeText(formData.get("company")) || null;
		const phone = normalizeText(formData.get("phone")) || null;
		const roleId = Number(formData.get("role_id"));
		const statusId = Number(formData.get("status_id"));
		const password = String(formData.get("password") ?? "");
		const confirmPassword = String(formData.get("confirm_password") ?? "");

		// Validación básica
		if (!name || !email || !roleId || !statusId) {
			return NextResponse.redirect(
				new URL(
					`/admin/users/usuarios/${id}/edit?error=datos-invalidos`,
					request.url,
				),
			);
		}

		if (password || confirmPassword) {
			if (password !== confirmPassword) {
				return NextResponse.redirect(
					new URL(
						`/admin/users/usuarios/${id}/edit?error=password-match`,
						request.url,
					),
				);
			}

			const passwordValidationMessage = getPasswordValidationMessage(password);

			if (passwordValidationMessage) {
				return NextResponse.redirect(
					new URL(
						`/admin/users/usuarios/${id}/edit?error=password-rules`,
						request.url,
					),
				);
			}
		}

		await client.query("BEGIN");

		// Bloquear el usuario actual
		const currentUserResult = await client.query(
			`
			SELECT
				id,
				name,
				email,
				company,
				phone,
				role_id,
				status_id
			FROM users
			WHERE id = $1
			FOR UPDATE
			`,
			[id],
		);

		const currentUser = currentUserResult.rows[0];

		if (!currentUser) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL("/admin/users/usuarios?error=no-encontrado", request.url),
			);
		}

		// Comprobar email duplicado
		const duplicateEmailResult = await client.query(
			`
			SELECT id
			FROM users
			WHERE lower(email) = lower($1)
			  AND id <> $2
			LIMIT 1
			`,
			[email, id],
		);

		if ((duplicateEmailResult.rowCount ?? 0) > 0) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL(
					`/admin/users/usuarios/${id}/edit?error=email-existe`,
					request.url,
				),
			);
		}

		// Validar rol y estado
		const [roleResult, statusResult] = await Promise.all([
			client.query<CatalogRow>(
				`
				SELECT id, code
				FROM roles
				WHERE id = $1
				LIMIT 1
				`,
				[roleId],
			),
			client.query<CatalogRow>(
				`
				SELECT id, code
				FROM user_statuses
				WHERE id = $1
				LIMIT 1
				`,
				[statusId],
			),
		]);

		const newRole = roleResult.rows[0];
		const newStatus = statusResult.rows[0];

		if (!newRole || !newStatus) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL(
					`/admin/users/usuarios/${id}/edit?error=datos-invalidos`,
					request.url,
				),
			);
		}
		if (password) {
			const newPasswordHash = await bcrypt.hash(password, 10);

			await client.query(
				`
		UPDATE users
		SET
			password_hash = $1,
			updated_at = NOW()
		WHERE id = $2
		`,
				[newPasswordHash, id],
			);
		}

		// Actualizar usuario
		await client.query(
			`
			UPDATE users
			SET
				name = $1,
				email = $2,
				company = $3,
				phone = $4,
				role_id = $5,
				status_id = $6,
				updated_at = NOW()
			WHERE id = $7
			`,
			[name, email, company, phone, roleId, statusId, id],
		);

		// Resolver tipos de acción
		const actionTypesResult = await client.query<CatalogRow>(
			`
			SELECT id, code
			FROM user_admin_action_types
			WHERE code IN ('role_change', 'status_change', 'password_reset')
			`,
		);

		const passwordResetActionId = actionTypesResult.rows.find(
			(row) => row.code === "password_reset",
		)?.id;

		const roleChangeActionId = actionTypesResult.rows.find(
			(row) => row.code === "role_change",
		)?.id;

		const statusChangeActionId = actionTypesResult.rows.find(
			(row) => row.code === "status_change",
		)?.id;

		const notesParts: string[] = [];

		if (currentUser.name !== name) {
			notesParts.push(`Nombre: "${currentUser.name}" -> "${name}"`);
		}

		if (currentUser.email !== email) {
			notesParts.push(`Correo: "${currentUser.email}" -> "${email}"`);
		}

		if ((currentUser.company ?? "") !== (company ?? "")) {
			notesParts.push(
				`Empresa: "${currentUser.company ?? "-"}" -> "${company ?? "-"}"`,
			);
		}

		if ((currentUser.phone ?? "") !== (phone ?? "")) {
			notesParts.push(
				`Teléfono: "${currentUser.phone ?? "-"}" -> "${phone ?? "-"}"`,
			);
		}

		const notes = notesParts.length > 0 ? notesParts.join(" | ") : null;

		// Registrar cambio de contraseña
		if (password && passwordResetActionId) {
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
					id,
					session.user.id,
					passwordResetActionId,
					"Contraseña actualizada por administrador",
				],
			);
		}

		// Registrar cambio de rol
		if (currentUser.role_id !== roleId && roleChangeActionId) {
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
				VALUES ($1, $2, $3, NULL, NULL, $4, $5, NULL, $6, NOW())
				`,
				[
					id,
					session.user.id,
					roleChangeActionId,
					currentUser.role_id,
					roleId,
					notes,
				],
			);
		}

		// Registrar cambio de estado
		if (currentUser.status_id !== statusId && statusChangeActionId) {
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
				VALUES ($1, $2, $3, $4, $5, NULL, NULL, NULL, $6, NOW())
				`,
				[
					id,
					session.user.id,
					statusChangeActionId,
					currentUser.status_id,
					statusId,
					notes,
				],
			);
		}

		// Si solo cambian datos generales, con tu catálogo actual no hay un tipo específico
		// Dejamos el cambio aplicado aunque no exista un action_type genérico para edición

		await client.query("COMMIT");

		return NextResponse.redirect(
			new URL(`/admin/users/usuarios/${id}?success=guardado`, request.url),
		);
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error en POST /api/admin/users/usuarios/[id]:", error);

		return NextResponse.redirect(
			new URL(`/admin/users/usuarios/${id}/edit?error=server`, request.url),
		);
	} finally {
		client.release();
	}
}

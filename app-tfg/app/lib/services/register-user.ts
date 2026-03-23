import bcrypt from "bcryptjs";
import type { PoolClient } from "pg";
import { pool } from "@/app/lib/db";
import { getPasswordValidationMessage } from "@/app/lib/password";

// Roles permitidos en este flujo
export type RegisterableUserRole = "client" | "commercial";

// Datos base del registro
export type RegisterUserInput = {
	email: string;
	name: string;
	company: string;
	phone?: string | null;
	password: string;
	role: RegisterableUserRole;
};

// Modos del servicio
export type RegisterUserMode = "request" | "admin_approved";

// Opciones completas del servicio
export type RegisterUserOptions = RegisterUserInput & {
	mode: RegisterUserMode;
	reviewedByUserId?: string;
};

// Resultado del servicio
export type RegisterUserResult = {
	ok: true;
	message: string;
	requestId?: string;
	userId?: string;
};

// Regex de validación
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

// Error controlado del servicio
export class RegisterUserError extends Error {
	status: number;

	constructor(message: string, status = 400) {
		super(message);
		this.name = "RegisterUserError";
		this.status = status;
	}
}

// Normaliza y valida los datos de entrada
function normalizeAndValidateInput(
	input: RegisterUserInput,
): RegisterUserInput {
	const email = String(input.email ?? "")
		.trim()
		.toLowerCase();
	const name = String(input.name ?? "").trim();
	const company = String(input.company ?? "").trim();
	const phone = String(input.phone ?? "").trim();
	const password = String(input.password ?? "");
	const role: RegisterableUserRole =
		input.role === "client" ? "client" : "commercial";

	// Campos obligatorios
	if (!email || !name || !company || !password) {
		throw new RegisterUserError("Faltan campos obligatorios", 400);
	}

	// Longitudes máximas
	const fieldsToValidate = {
		name: { value: name, max: 120, label: "El nombre" },
		company: { value: company, max: 120, label: "El nombre de la empresa" },
		phone: { value: phone, max: 30, label: "El teléfono" },
		password: { value: password, max: 100, label: "La contraseña" },
	};

	for (const field of Object.values(fieldsToValidate)) {
		if (field.value.length > field.max) {
			throw new RegisterUserError(`${field.label} es demasiado largo`, 400);
		}
	}

	// Formato de correo
	if (!EMAIL_REGEX.test(email)) {
		throw new RegisterUserError(
			"El correo electrónico no tiene un formato válido",
			400,
		);
	}

	// Formato de teléfono
	if (phone && !PHONE_REGEX.test(phone)) {
		throw new RegisterUserError("El teléfono no tiene un formato válido", 400);
	}

	// Reglas de contraseña
	const passwordValidationMessage = getPasswordValidationMessage(password);

	if (passwordValidationMessage) {
		throw new RegisterUserError(passwordValidationMessage, 400);
	}

	return {
		email,
		name,
		company,
		phone: phone || null,
		password,
		role,
	};
}

// Resuelve los IDs de catálogos que necesita el servicio
async function resolveCatalogIds(
	client: PoolClient,
	roleCode: RegisterableUserRole,
	mode: RegisterUserMode,
) {
	const requestStatusCode = mode === "request" ? "pending" : "approved";
	const requestSourceCode =
		mode === "request" ? "self_registration" : "admin_created";
	const activeUserStatusCode = "active";

	const catalogQuery = await client.query<{
		kind: string;
		id: number;
		code: string;
	}>(
		`
			SELECT 'role' AS kind, id, code
			FROM roles
			WHERE code = $1

			UNION ALL

			SELECT 'request_status' AS kind, id, code
			FROM request_statuses
			WHERE code = $2

			UNION ALL

			SELECT 'request_source_type' AS kind, id, code
			FROM request_source_types
			WHERE code = $3

			UNION ALL

			SELECT 'user_status' AS kind, id, code
			FROM user_statuses
			WHERE code = $4
		`,
		[roleCode, requestStatusCode, requestSourceCode, activeUserStatusCode],
	);

	const roleRow = catalogQuery.rows.find((row) => row.kind === "role");
	const requestStatusRow = catalogQuery.rows.find(
		(row) => row.kind === "request_status",
	);
	const requestSourceRow = catalogQuery.rows.find(
		(row) => row.kind === "request_source_type",
	);
	const userStatusRow = catalogQuery.rows.find(
		(row) => row.kind === "user_status",
	);

	if (!roleRow) {
		throw new RegisterUserError(
			"No existe el rol solicitado en el sistema",
			500,
		);
	}

	if (!requestStatusRow) {
		throw new RegisterUserError(
			"No existe el estado de solicitud requerido en el sistema",
			500,
		);
	}

	if (!requestSourceRow) {
		throw new RegisterUserError(
			"No existe el origen de solicitud requerido en el sistema",
			500,
		);
	}

	if (!userStatusRow) {
		throw new RegisterUserError(
			"No existe el estado de usuario requerido en el sistema",
			500,
		);
	}

	return {
		roleId: Number(roleRow.id),
		requestStatusId: Number(requestStatusRow.id),
		requestSourceTypeId: Number(requestSourceRow.id),
		activeUserStatusId: Number(userStatusRow.id),
	};
}

// Servicio común de registro
export async function registerUser(
	options: RegisterUserOptions,
): Promise<RegisterUserResult> {
	const normalized = normalizeAndValidateInput(options);

	// En alta aprobada necesitamos saber quién aprueba
	if (
		options.mode === "admin_approved" &&
		(!options.reviewedByUserId || options.reviewedByUserId.trim() === "")
	) {
		throw new RegisterUserError(
			"Falta el identificador del administrador revisor",
			400,
		);
	}

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		// Comprobar si ya existe un usuario con ese correo
		const existingUser = await client.query(
			`
				SELECT id
				FROM users
				WHERE lower(email) = lower($1)
				LIMIT 1
			`,
			[normalized.email],
		);

		if ((existingUser.rowCount ?? 0) > 0) {
			throw new RegisterUserError("Ya existe una cuenta con ese correo", 409);
		}

		// Resolver IDs internos
		const { roleId, requestStatusId, requestSourceTypeId, activeUserStatusId } =
			await resolveCatalogIds(client, normalized.role, options.mode);

		// Comprobar si ya existe una solicitud pendiente con ese correo
		const existingPendingRequest = await client.query(
			`
				SELECT ur.id
				FROM user_requests ur
				INNER JOIN request_statuses rs
					ON rs.id = ur.status_id
				WHERE lower(ur.email) = lower($1)
				  AND rs.code = 'pending'
				LIMIT 1
			`,
			[normalized.email],
		);

		if ((existingPendingRequest.rowCount ?? 0) > 0) {
			throw new RegisterUserError(
				"Ya existe una solicitud pendiente para este correo",
				409,
			);
		}

		// Hashear contraseña
		const passwordHash = await bcrypt.hash(normalized.password, 10);

		// Registro público: crea solo la solicitud
		if (options.mode === "request") {
			const insertedRequest = await client.query<{ id: string }>(
				`
					INSERT INTO user_requests (
						name,
						email,
						company,
						phone,
						password_hash,
						requested_role_id,
						status_id,
						request_source_type_id,
						requested_at
					)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
					RETURNING id
				`,
				[
					normalized.name,
					normalized.email,
					normalized.company,
					normalized.phone,
					passwordHash,
					roleId,
					requestStatusId,
					requestSourceTypeId,
				],
			);

			await client.query("COMMIT");

			return {
				ok: true,
				message: "Solicitud enviada correctamente",
				requestId: insertedRequest.rows[0]?.id,
			};
		}

		// Alta aprobada por admin: crea usuario real
		const insertedUser = await client.query<{ id: string }>(
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
				normalized.name,
				normalized.email,
				normalized.company,
				normalized.phone,
				passwordHash,
				roleId,
				activeUserStatusId,
			],
		);

		const createdUserId = insertedUser.rows[0]?.id;

		// Guardar también la solicitud aprobada para trazabilidad
		const insertedApprovedRequest = await client.query<{ id: string }>(
			`
				INSERT INTO user_requests (
					name,
					email,
					company,
					phone,
					password_hash,
					requested_role_id,
					status_id,
					request_source_type_id,
					requested_at,
					reviewed_at,
					reviewed_by,
					rejection_reason,
					created_user_id
				)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9, NULL, $10)
				RETURNING id
			`,
			[
				normalized.name,
				normalized.email,
				normalized.company,
				normalized.phone,
				passwordHash,
				roleId,
				requestStatusId,
				requestSourceTypeId,
				options.reviewedByUserId,
				createdUserId,
			],
		);

		await client.query("COMMIT");

		return {
			ok: true,
			message: "Usuario registrado correctamente",
			userId: createdUserId,
			requestId: insertedApprovedRequest.rows[0]?.id,
		};
	} catch (error: unknown) {
		await client.query("ROLLBACK");

		// Error controlado del servicio
		if (error instanceof RegisterUserError) {
			throw error;
		}

		// Error de restricción única
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			error.code === "23505"
		) {
			throw new RegisterUserError(
				"Ya existe una cuenta o solicitud pendiente para este correo",
				409,
			);
		}

		// Error de check constraint
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			error.code === "23514"
		) {
			throw new RegisterUserError("Los datos enviados no son válidos", 400);
		}

		// Error de clave foránea
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			error.code === "23503"
		) {
			throw new RegisterUserError(
				"No se pudo resolver alguno de los valores internos requeridos",
				500,
			);
		}

		console.error("Error en registerUser:", error);
		throw new RegisterUserError("Error interno del servidor", 500);
	} finally {
		client.release();
	}
}

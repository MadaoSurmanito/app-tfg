import bcrypt from "bcryptjs";
import { pool } from "@/app/lib/db";

/**
 * Tipos de usuario permitidos para alta desde solicitud o desde administración.
 * No incluimos "admin" porque este flujo solo crea clientes o comerciales.
 */
export type RegisterableUserRole = "cliente" | "comercial";

/**
 * Datos base que necesitamos para registrar un usuario o una solicitud.
 */
export type RegisterUserInput = {
	email: string;
	name: string;
	company: string;
	phone?: string | null;
	password: string;
	role: RegisterableUserRole;
};

/**
 * Modo de funcionamiento del servicio:
 * - "request": crea una solicitud pendiente en user_requests
 * - "admin_approved": crea el usuario real en users y además deja trazabilidad en user_requests como aprobada
 */
export type RegisterUserMode = "request" | "admin_approved";

/**
 * Opciones completas del servicio común.
 */
export type RegisterUserOptions = RegisterUserInput & {
	mode: RegisterUserMode;
	reviewedByUserId?: string; // obligatorio realmente solo en admin_approved
};

/**
 * Resultado del servicio para que los endpoints puedan responder de forma uniforme.
 */
export type RegisterUserResult = {
	ok: true;
	message: string;
	requestId?: string;
	userId?: string;
};

/**
 * Expresión regular para validar correo electrónico.
 */
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/**
 * Expresión regular para validar teléfono internacional tipo E.164.
 * Ejemplos válidos:
 * +34600111222
 * 34600111222
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Error controlado de aplicación para devolver mensajes claros y códigos HTTP apropiados.
 */
export class RegisterUserError extends Error {
	status: number;

	constructor(message: string, status = 400) {
		super(message);
		this.name = "RegisterUserError";
		this.status = status;
	}
}

/**
 * Normaliza y valida la entrada antes de tocar la base de datos.
 * Devuelve los datos ya limpios.
 */
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
		input.role === "cliente" ? "cliente" : "comercial";

	/**
	 * Campos obligatorios.
	 */
	if (!email || !name || !company || !password) {
		throw new RegisterUserError("Faltan campos obligatorios", 400);
	}

	/**
	 * Longitudes máximas para evitar abusos y errores.
	 */
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

	/**
	 * Formato de correo.
	 */
	if (!EMAIL_REGEX.test(email)) {
		throw new RegisterUserError(
			"El correo electrónico no tiene un formato válido",
			400,
		);
	}

	/**
	 * Formato de teléfono solo si se proporciona.
	 */
	if (phone && !PHONE_REGEX.test(phone)) {
		throw new RegisterUserError("El teléfono no tiene un formato válido", 400);
	}

	/**
	 * Longitud mínima razonable de contraseña.
	 * Puedes subirla si quieres a 6, 8, etc.
	 */
	if (password.length < 4) {
		throw new RegisterUserError(
			"La contraseña debe tener al menos 4 caracteres",
			400,
		);
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

/**
 * Servicio común reutilizable por:
 * - /api/auth/register-request
 * - /api/admin/register-user
 *
 * Este servicio:
 * 1. valida los datos
 * 2. comprueba duplicados
 * 3. crea solicitud pendiente o alta aprobada al instante
 * 4. usa transacción para evitar inconsistencias
 */
export async function registerUser(
	options: RegisterUserOptions,
): Promise<RegisterUserResult> {
	const normalized = normalizeAndValidateInput(options);

	/**
	 * Para altas aprobadas instantáneamente exigimos saber quién las aprueba.
	 */
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

		/**
		 * 1) Comprobar si ya existe un usuario real con ese correo.
		 */
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

		/**
		 * 2) Comprobar si ya existe una solicitud pendiente con ese correo.
		 * Solo bloqueamos las pendientes porque el índice único parcial también hace eso.
		 */
		const existingPendingRequest = await client.query(
			`
				SELECT id
				FROM user_requests
				WHERE lower(email) = lower($1)
				  AND status = 'pendiente'
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

		/**
		 * 3) Hasheamos la contraseña una única vez.
		 */
		const passwordHash = await bcrypt.hash(normalized.password, 10);

		/**
		 * Flujo A:
		 * Registro público -> solo crea solicitud pendiente.
		 */
		if (options.mode === "request") {
			const insertedRequest = await client.query(
				`
					INSERT INTO user_requests (
						name,
						email,
						company,
						phone,
						password_hash,
						requested_role,
						status,
						requested_at
					)
					VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', NOW())
					RETURNING id
				`,
				[
					normalized.name,
					normalized.email,
					normalized.company,
					normalized.phone,
					passwordHash,
					normalized.role,
				],
			);

			await client.query("COMMIT");

			return {
				ok: true,
				message: "Solicitud enviada correctamente",
				requestId: insertedRequest.rows[0]?.id,
			};
		}

		/**
		 * Flujo B:
		 * Alta directa por admin -> crea usuario real y además guarda la solicitud ya aprobada.
		 */
		const insertedUser = await client.query(
			`
				INSERT INTO users (
					name,
					email,
					company,
					phone,
					password_hash,
					role,
					status,
					image_url,
					last_login,
					created_at
				)
				VALUES ($1, $2, $3, $4, $5, $6, 'activo', NULL, NOW(), NOW())
				RETURNING id
			`,
			[
				normalized.name,
				normalized.email,
				normalized.company,
				normalized.phone,
				passwordHash,
				normalized.role,
			],
		);

		const createdUserId = insertedUser.rows[0]?.id;

		/**
		 * Guardamos también la petición en user_requests para mantener
		 * la trazabilidad histórica, pero directamente aprobada.
		 */
		const insertedApprovedRequest = await client.query(
			`
				INSERT INTO user_requests (
					name,
					email,
					company,
					phone,
					password_hash,
					status,
					requested_at,
					reviewed_at,
					reviewed_by,
					rejection_reason,
					approved_user_id
				)
				VALUES ($1, $2, $3, $4, $5, 'aprobada', NOW(), NOW(), $6, NULL, $7)
				RETURNING id
			`,
			[
				normalized.name,
				normalized.email,
				normalized.company,
				normalized.phone,
				passwordHash,
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

		/**
		 * Error de aplicación controlado.
		 */
		if (error instanceof RegisterUserError) {
			throw error;
		}

		/**
		 * Error típico de restricción única en PostgreSQL.
		 * Por ejemplo si dos peticiones concurrentes intentan crear el mismo correo.
		 */
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

		/**
		 * Error típico de CHECK constraint en PostgreSQL.
		 */
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			error.code === "23514"
		) {
			throw new RegisterUserError("Los datos enviados no son válidos", 400);
		}

		console.error("Error en registerUser:", error);
		throw new RegisterUserError("Error interno del servidor", 500);
	} finally {
		client.release();
	}
}

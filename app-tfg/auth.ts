import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { pool } from "@/app/lib/db";

// Extendemos los tipos de NextAuth para incluir el role en el JWT y la sesión
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			role: string;
			name?: string | null;
			email?: string | null;
			phone?: string | null;
			image?: string | null;
		};
		accessSessionId?: string;
	}
}

// Esto es para que TypeScript sepa que el JWT puede tener campos personalizados
declare module "@auth/core/jwt" {
	interface JWT {
		role?: string;
		phone?: string | null;
		name?: string | null;
		image?: string | null;
		accessSessionId?: string;
	}
}

// Registra eventos de acceso sin romper el login si falla la trazabilidad
async function logAccessEvent(params: {
	userId?: string | null;
	emailAttempted?: string | null;
	eventCode: "login_success" | "login_failed";
	resultCode: "success" | "failed";
	failureReason?: string | null;
	session_token?: string | null;
	ip_address?: string | null;
	user_agent?: string | null;
	revoked_at?: Date | null;
	expires_at?: Date | null;
}) {
	try {
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
			console.error("[login] no se pudieron resolver los catálogos de acceso");
			return;
		}

		// Registramos el evento de acceso en la base de datos
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
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
			`,
			[
				params.userId ?? null,
				params.emailAttempted ?? null,
				eventTypeId,
				resultTypeId,
				params.failureReason ?? null,
				params.session_token ?? null,
				params.ip_address ?? null,
				params.user_agent ?? null,
				params.revoked_at ?? null,
				params.expires_at ?? null,
			],
		);
	} catch (error) {
		console.error("[login] error al registrar evento de acceso:", error);
	}
}

// Configuración de NextAuth con el proveedor de credenciales
export const { handlers, auth, signIn, signOut } = NextAuth({
	// Esto es importante para que NextAuth confíe en los encabezados de host y funcione correctamente detrás de proxies o en entornos como Vercel
	trustHost: true,
	// Usamos JWT para la sesión, lo que es más adecuado para APIs sin estado
	session: {
		strategy: "jwt",
		// Ajusta esto a lo que quieras para tu app
		maxAge: 60 * 60 * 24 * 30, // 30 días
	},
	// Configuramos el proveedor de credenciales para autenticación personalizada
	providers: [
		Credentials({
			// Definimos los campos que esperamos en las credenciales
			credentials: {
				identifier: {}, // email, phone, o name
				password: {},
			},
			// La función authorize se encarga de verificar las credenciales y devolver el usuario si son válidas
			async authorize(credentials, request) {
				try {
					// Validamos que se hayan proporcionado las credenciales necesarias
					const identifier = String(credentials?.identifier ?? "")
						.trim()
						.toLowerCase();
					const password = String(credentials?.password ?? "");

					const ip_address =
						request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
						request.headers.get("x-real-ip") ||
						null;

					const user_agent = request.headers.get("user-agent") || null;

					if (!identifier || !password) {
						console.log("[login] faltan credenciales");

						await logAccessEvent({
							userId: null,
							emailAttempted: identifier || null,
							eventCode: "login_failed",
							resultCode: "failed",
							failureReason: "missing_credentials",
							session_token: null,
							ip_address,
							user_agent,
							revoked_at: null,
							expires_at: null,
						});

						return null;
					}

					// Buscamos el usuario por email, phone o name
					// Se utilizan consultas parametrizadas ($1) para evitar SQL injections
					const result = await pool.query(
						`
						SELECT
							u.id,
							u.email,
							u.phone,
							u.name,
							u.password_hash,
							u.profile_image_url,
							r.code AS role_code,
							us.code AS status_code
						FROM users u
						INNER JOIN roles r
							ON r.id = u.role_id
						INNER JOIN user_statuses us
							ON us.id = u.status_id
						WHERE
							LOWER(u.email) = $1
							OR LOWER(COALESCE(u.phone, '')) = $1
							OR LOWER(u.name) = $1
						LIMIT 1
						`,
						[identifier],
					);

					const user = result.rows[0];

					// Si no se encuentra el usuario, devolvemos null para indicar que las credenciales son inválidas
					if (!user) {
						console.log("[login] usuario no encontrado");

						await logAccessEvent({
							userId: null,
							emailAttempted: identifier,
							eventCode: "login_failed",
							resultCode: "failed",
							failureReason: "user_not_found",
							session_token: null,
							ip_address,
							user_agent,
							revoked_at: null,
							expires_at: null,
						});

						return null;
					}

					// Comprobamos que la cuenta esté activa antes de validar la contraseña
					if (user.status_code !== "active") {
						console.log("[login] usuario no activo:", user.status_code);

						await logAccessEvent({
							userId: String(user.id),
							emailAttempted: user.email,
							eventCode: "login_failed",
							resultCode: "failed",
							failureReason: `status_${user.status_code}`,
							session_token: null,
							ip_address,
							user_agent,
							revoked_at: null,
							expires_at: null,
						});

						return null;
					}

					// Comparamos la contraseña proporcionada con el hash almacenado en la base de datos usando bcrypt
					const valid = await bcrypt.compare(password, user.password_hash);

					if (!valid) {
						console.log("[login] contraseña incorrecta");

						await logAccessEvent({
							userId: String(user.id),
							emailAttempted: user.email,
							eventCode: "login_failed",
							resultCode: "failed",
							failureReason: "invalid_password",
							session_token: null,
							ip_address,
							user_agent,
							revoked_at: null,
							expires_at: null,
						});

						return null;
					}

					// Generamos un identificador propio para esta sesión
					const accessSessionId = randomUUID();

					// Calculamos la expiración teórica de la sesión
					const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

					// Si las credenciales son válidas:
					// Actualizamos el último acceso y registramos el evento correcto
					await pool.query(
						`
						UPDATE users
						SET last_login_at = NOW(),
						    updated_at = NOW()
						WHERE id = $1
						`,
						[user.id],
					);

					await logAccessEvent({
						userId: String(user.id),
						emailAttempted: user.email,
						eventCode: "login_success",
						resultCode: "success",
						failureReason: null,
						session_token: accessSessionId,
						ip_address,
						user_agent,
						revoked_at: null,
						expires_at,
					});

					// Devolvemos un objeto con la información del usuario que queremos incluir en el JWT y la sesión
					return {
						id: String(user.id),
						email: user.email,
						phone: user.phone,
						role: user.role_code,
						name: user.name,
						image: user.profile_image_url,
						accessSessionId,
					};
				} catch (error) {
					console.error("[login] error en authorize:", error);
					return null;
				}
			},
		}),
	],
	// Configuramos la página de inicio de sesión personalizada
	pages: {
		signIn: "/login",
	},
	// Callbacks para incluir el role en el JWT y la sesión
	callbacks: {
		// El callback jwt se llama cada vez que se crea o actualiza el token JWT
		async jwt({ token, user }) {
			if (user) {
				if ("role" in user) token.role = user.role as string;
				if ("phone" in user) token.phone = user.phone as string | null;
				if ("name" in user) token.name = user.name as string | null;
				if ("image" in user) token.image = user.image as string | null;
				if ("accessSessionId" in user) {
					token.accessSessionId = user.accessSessionId as string;
				}
			}
			return token;
		},
		// El callback session se llama cada vez que se obtiene la sesión
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.sub ?? "";
				session.user.role = typeof token.role === "string" ? token.role : "";
				session.user.phone =
					typeof token.phone === "string" ? token.phone : null;
				session.user.name = typeof token.name === "string" ? token.name : null;
				session.user.image =
					typeof token.image === "string" ? token.image : null;
				session.accessSessionId =
					typeof token.accessSessionId === "string"
						? token.accessSessionId
						: undefined;
			}
			return session;
		},
	},
});

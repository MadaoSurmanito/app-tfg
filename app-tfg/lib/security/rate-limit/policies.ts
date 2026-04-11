import { type RateLimitPolicy } from "./types";

// -----------------------------------------------------------------------------
// POLÍTICAS CENTRALIZADAS DE RATE LIMIT
// -----------------------------------------------------------------------------
// Aquí definimos todos los límites reutilizables de la aplicación.
// La idea es mantener en un solo sitio:
//
// - cuánto permitimos
// - en qué ventana temporal
// - contra qué identidad limitamos (IP / usuario / email)
//
// Así evitamos "números mágicos" repartidos por el proyecto.
export const RATE_LIMIT_POLICIES = {
	DEFAULT_API: {
		name: "DEFAULT_API",
		keyPrefix: "@kinestilistas/ratelimit/default-api",
		maxRequests: 120,
		windowMs: 60 * 1000,
		scope: "ip",
		message:
			"Demasiadas peticiones a la API. Inténtalo de nuevo en unos segundos.",
	},

	AUTH_API: {
		name: "AUTH_API",
		keyPrefix: "@kinestilistas/ratelimit/auth-api",
		maxRequests: 40,
		windowMs: 60 * 1000,
		scope: "ip",
		message:
			"Se han realizado demasiadas operaciones de autenticación en poco tiempo.",
	},

	REGISTER_REQUEST: {
		name: "REGISTER_REQUEST",
		keyPrefix: "@kinestilistas/ratelimit/register-request",
		maxRequests: 5,
		windowMs: 30 * 60 * 1000,
		scope: "ip",
		message:
			"Has enviado demasiadas solicitudes de registro en poco tiempo. Espera antes de volver a intentarlo.",
	},

	ADMIN_GENERIC_READ: {
		name: "ADMIN_GENERIC_READ",
		keyPrefix: "@kinestilistas/ratelimit/admin-read",
		maxRequests: 60,
		windowMs: 60 * 1000,
		scope: "user_or_ip",
		message:
			"Se han realizado demasiadas consultas de administración en poco tiempo.",
	},

	ADMIN_GENERIC_WRITE: {
		name: "ADMIN_GENERIC_WRITE",
		keyPrefix: "@kinestilistas/ratelimit/admin-write",
		maxRequests: 30,
		windowMs: 60 * 1000,
		scope: "user_or_ip",
		message:
			"Se han realizado demasiadas operaciones de administración en poco tiempo.",
	},

	ADMIN_USERS_READ: {
		name: "ADMIN_USERS_READ",
		keyPrefix: "@kinestilistas/ratelimit/admin-users-read",
		maxRequests: 30,
		windowMs: 60 * 1000,
		scope: "user_or_ip",
		message:
			"Se han realizado demasiadas consultas del listado de usuarios en poco tiempo.",
	},

	ADMIN_USERS_WRITE: {
		name: "ADMIN_USERS_WRITE",
		keyPrefix: "@kinestilistas/ratelimit/admin-users-write",
		maxRequests: 15,
		windowMs: 60 * 1000,
		scope: "user_or_ip",
		message:
			"Se han realizado demasiadas modificaciones de usuarios en poco tiempo.",
	},

	PROFILE_IMAGE_UPLOAD: {
		name: "PROFILE_IMAGE_UPLOAD",
		keyPrefix: "@kinestilistas/ratelimit/profile-image-upload",
		maxRequests: 10,
		windowMs: 10 * 60 * 1000,
		scope: "user_or_ip",
		message:
			"Has subido demasiadas imágenes de perfil en poco tiempo. Espera antes de volver a intentarlo.",
	},

	LOGIN_IP: {
		name: "LOGIN_IP",
		keyPrefix: "@kinestilistas/ratelimit/login-ip",
		maxRequests: 10,
		windowMs: 10 * 60 * 1000,
		scope: "ip",
		message:
			"Se han detectado demasiados intentos de acceso desde esta IP en poco tiempo.",
	},

	LOGIN_IDENTIFIER: {
		name: "LOGIN_IDENTIFIER",
		keyPrefix: "@kinestilistas/ratelimit/login-identifier",
		maxRequests: 8,
		windowMs: 15 * 60 * 1000,
		scope: "email_or_ip",
		message:
			"Se han detectado demasiados intentos de acceso para esta cuenta en poco tiempo.",
	},
} as const satisfies Record<string, RateLimitPolicy>;

// -----------------------------------------------------------------------------
// RESOLUCIÓN DE POLÍTICAS SEGÚN RUTA Y MÉTODO
// -----------------------------------------------------------------------------
// Decide qué política de rate limit aplicar a una API route concreta.
// El criterio principal es:
//
// - rutas especialmente sensibles: auth, registro, uploads
// - rutas de administración
// - resto de API: política por defecto
export function resolveApiRateLimitPolicy(pathname: string, method: string) {
	const normalizedMethod = method.toUpperCase();

	if (pathname.startsWith("/api/profile/upload-image")) {
		return RATE_LIMIT_POLICIES.PROFILE_IMAGE_UPLOAD;
	}

	if (pathname.startsWith("/api/auth/register-request")) {
		return RATE_LIMIT_POLICIES.REGISTER_REQUEST;
	}

	if (pathname.startsWith("/api/auth/")) {
		return RATE_LIMIT_POLICIES.AUTH_API;
	}

	if (pathname.startsWith("/api/admin/users")) {
		return normalizedMethod === "GET"
			? RATE_LIMIT_POLICIES.ADMIN_USERS_READ
			: RATE_LIMIT_POLICIES.ADMIN_USERS_WRITE;
	}

	if (pathname.startsWith("/api/admin/")) {
		return normalizedMethod === "GET"
			? RATE_LIMIT_POLICIES.ADMIN_GENERIC_READ
			: RATE_LIMIT_POLICIES.ADMIN_GENERIC_WRITE;
	}

	return RATE_LIMIT_POLICIES.DEFAULT_API;
}

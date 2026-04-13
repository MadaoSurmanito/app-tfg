import { type RateLimitIdentityContext, type RateLimitPolicy } from "./types";

// -----------------------------------------------------------------------------
// HELPERS DE IDENTIDAD PARA RATE LIMIT
// -----------------------------------------------------------------------------
// Estas funciones transforman la request o el contexto de sesión en una
// identidad estable sobre la que limitar:
//
// - IP
// - usuario autenticado
// - email / identificador de login
//
// De este modo las políticas no necesitan conocer detalles de cabeceras
// ni formatos concretos.
function getFirstForwardedIp(value: string | null) {
	if (!value) return null;

	const first = value.split(",")[0]?.trim();

	return first || null;
}

function parseForwardedHeader(value: string | null) {
	if (!value) return null;

	const forPart = value
		.split(";")
		.map((part) => part.trim())
		.find((part) => part.toLowerCase().startsWith("for="));

	if (!forPart) return null;

	const rawValue = forPart.slice(4).trim();

	return rawValue
		.replace(/^"/, "")
		.replace(/"$/, "")
		.replace(/^\[/, "")
		.replace(/\]$/, "")
		.split(":")[0]
		.trim();
}

// Extrae la IP más fiable disponible a partir de cabeceras comunes de proxy,
// CDN o balanceador.
export function getClientIpFromHeaders(headers: Headers) {
	return (
		getFirstForwardedIp(headers.get("cf-connecting-ip")) ||
		getFirstForwardedIp(headers.get("x-forwarded-for")) ||
		getFirstForwardedIp(headers.get("x-real-ip")) ||
		getFirstForwardedIp(headers.get("x-client-ip")) ||
		getFirstForwardedIp(headers.get("x-vercel-forwarded-for")) ||
		parseForwardedHeader(headers.get("forwarded")) ||
		null
	);
}

// Normaliza un email o identificador textual para usarlo como clave estable
// en políticas de rate limit asociadas a la cuenta.
export function normalizeRateLimitEmail(value: string | null | undefined) {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

// Resuelve la identidad concreta sobre la que aplicar una política.
// Por ejemplo:
//
// - scope "ip"           -> ip:1.2.3.4
// - scope "user_or_ip"   -> user:uuid / ip:1.2.3.4
// - scope "email_or_ip"  -> email:foo@bar.com / ip:1.2.3.4
export function resolveRateLimitIdentifier(
	policy: RateLimitPolicy,
	context: RateLimitIdentityContext,
) {
	const ipKey = `ip:${context.ipAddress ?? "unknown"}`;
	const userKey = context.userId ? `user:${context.userId}` : null;
	const emailKey = context.email
		? `email:${normalizeRateLimitEmail(context.email)}`
		: null;

	switch (policy.scope) {
		case "ip":
			return ipKey;

		case "user_or_ip":
			return userKey ?? ipKey;

		case "email_or_ip":
			return emailKey ?? ipKey;

		default:
			return ipKey;
	}
}

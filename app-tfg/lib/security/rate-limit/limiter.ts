import { consumeRateLimit } from "./store";
import { type RateLimitPolicy } from "./types";

// -----------------------------------------------------------------------------
// APLICACIÓN DEL RATE LIMIT
// -----------------------------------------------------------------------------
// Construye una clave compuesta por:
//
// - el prefijo lógico de la política
// - la identidad sobre la que limitamos
//
// y consume una unidad de esa cuota.
export function applyRateLimit(policy: RateLimitPolicy, identifier: string) {
	const key = `${policy.keyPrefix}:${identifier}`;

	return consumeRateLimit(key, policy.maxRequests, policy.windowMs);
}

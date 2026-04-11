import { NextResponse } from "next/server";
import { type RateLimitPolicy, type RateLimitResult } from "./types";

// -----------------------------------------------------------------------------
// HELPERS DE RESPUESTA HTTP PARA RATE LIMIT
// -----------------------------------------------------------------------------
// Centralizamos aquí la construcción de respuestas 429 y cabeceras estándar,
// para no repetir formato en proxy o Route Handlers.
function getRetryAfterSeconds(resetAt: number) {
	const retryAfterSeconds = Math.ceil((resetAt - Date.now()) / 1000);
	return retryAfterSeconds > 0 ? retryAfterSeconds : 1;
}

export function buildRateLimitHeaders(result: RateLimitResult) {
	const headers = new Headers();

	headers.set("X-RateLimit-Limit", String(result.limit));
	headers.set("X-RateLimit-Remaining", String(result.remaining));
	headers.set("X-RateLimit-Reset", String(result.resetAt));
	headers.set("Retry-After", String(getRetryAfterSeconds(result.resetAt)));

	return headers;
}

export function createRateLimitExceededResponse(
	policy: RateLimitPolicy,
	result: RateLimitResult,
) {
	const headers = buildRateLimitHeaders(result);
	headers.set("Cache-Control", "no-store");

	return NextResponse.json(
		{
			message: policy.message,
			code: "RATE_LIMIT_EXCEEDED",
			retryAfterSeconds: getRetryAfterSeconds(result.resetAt),
		},
		{
			status: 429,
			headers,
		},
	);
}

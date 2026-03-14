import { NextResponse } from "next/server";
import {
	registerUser,
	RegisterUserError,
	type RegisterableUserRole,
} from "@/app/lib/services/register-user";

/**
 * Tipo del body esperado desde el formulario público.
 */
type RegisterRequestBody = {
	email?: string;
	name?: string;
	company?: string;
	phone?: string;
	password?: string;
	type?: RegisterableUserRole;
};

/**
 * Endpoint público para crear una solicitud de registro.
 *
 * Este endpoint NO crea usuarios directamente.
 * Solo deja una fila en user_requests con estado "pendiente".
 */
export async function POST(request: Request) {
	try {
		const body = (await request.json()) as RegisterRequestBody;

		/**
		 * Ejecutamos el servicio común en modo "request".
		 */
		const result = await registerUser({
			email: String(body.email ?? ""),
			name: String(body.name ?? ""),
			company: String(body.company ?? ""),
			phone: String(body.phone ?? ""),
			password: String(body.password ?? ""),
			role: body.type === "cliente" ? "cliente" : "comercial",
			mode: "request",
		});

		return NextResponse.json(
			{ message: result.message, requestId: result.requestId },
			{ status: 201 },
		);
	} catch (error: unknown) {
		/**
		 * Errores controlados del servicio.
		 */
		if (error instanceof RegisterUserError) {
			return NextResponse.json(
				{ message: error.message },
				{ status: error.status },
			);
		}

		console.error("Error en /api/auth/register-request:", error);

		return NextResponse.json(
			{ message: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

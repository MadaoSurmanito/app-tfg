import { NextResponse } from "next/server";
import {
	registerUser,
	RegisterUserError,
	type RegisterableUserRole,
} from "@/app/lib/services/register-user";

/**
 * Tipo del body esperado desde el formulario público.
 *
 * En el formulario público actual el usuario solicita acceso como cliente.
 * Aun así dejamos el campo "type" tipado por si en el futuro quieres reutilizar
 * este endpoint para otros flujos controlados.
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
 * Solo deja una fila en user_requests con estado pendiente.
 */
export async function POST(request: Request) {
	try {
		const body = (await request.json()) as RegisterRequestBody;

		/**
		 * En el registro público el comportamiento por defecto debe ser "cliente".
		 *
		 * Si más adelante decides exponer distintos tipos de solicitud desde UI,
		 * puedes mantener esta resolución centralizada aquí.
		 */
		const requestedRole: RegisterableUserRole =
			body.type === "commercial" ? "commercial" : "client";

		/**
		 * Ejecutamos el servicio común en modo "request".
		 *
		 * El servicio será el encargado de:
		 * - validar datos
		 * - comprobar duplicados
		 * - resolver el role_id correspondiente
		 * - insertar en user_requests
		 */
		const result = await registerUser({
			email: String(body.email ?? ""),
			name: String(body.name ?? ""),
			company: String(body.company ?? ""),
			phone: String(body.phone ?? ""),
			password: String(body.password ?? ""),
			role: requestedRole,
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

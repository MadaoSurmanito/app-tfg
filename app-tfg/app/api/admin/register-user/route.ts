import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	registerUser,
	RegisterUserError,
	type RegisterableUserRole,
} from "@/app/lib/services/register-user";

/**
 * Tipo del body esperado desde el formulario del panel de administración.
 */
type AdminRegisterUserBody = {
	email?: string;
	name?: string;
	company?: string;
	phone?: string;
	password?: string;
	type?: RegisterableUserRole;
};

/**
 * Endpoint exclusivo para administradores.
 *
 * Este endpoint:
 * - verifica que el usuario autenticado sea admin
 * - crea el usuario real en users
 * - crea también una entrada en user_requests como "aprobada"
 */
export async function POST(request: Request) {
	try {
		/**
		 * Comprobamos autenticación y rol.
		 */
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ message: "No autenticado" }, { status: 401 });
		}

		if (session.user.role !== "admin") {
			return NextResponse.json({ message: "No autorizado" }, { status: 403 });
		}

		const body = (await request.json()) as AdminRegisterUserBody;

		/**
		 * Ejecutamos el servicio común en modo admin_approved.
		 * Así queda todo centralizado y no duplicamos lógica.
		 */
		const result = await registerUser({
			email: String(body.email ?? ""),
			name: String(body.name ?? ""),
			company: String(body.company ?? ""),
			phone: String(body.phone ?? ""),
			password: String(body.password ?? ""),
			role: body.type === "cliente" ? "cliente" : "comercial",
			mode: "admin_approved",
			reviewedByUserId: session.user.id,
		});

		return NextResponse.json(
			{
				message: result.message,
				userId: result.userId,
				requestId: result.requestId,
			},
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

		console.error("Error en /api/admin/register-user:", error);

		return NextResponse.json(
			{ message: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

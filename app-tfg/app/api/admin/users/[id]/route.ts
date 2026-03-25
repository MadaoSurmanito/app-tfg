import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/app/lib/typeorm/services/users/get-user-by-id";

type Context = {
	params: Promise<{ id: string }>;
};

// Devuelve el detalle de un usuario concreto.
// Solo accesible para administradores.
export async function GET(_: Request, context: Context) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 });
		}

		const { id } = await context.params;
		const user = await getUserById(id);

		if (!user) {
			return NextResponse.json(
				{ error: "Usuario no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error getting user by id:", error);

		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRequestById } from "@/lib/typeorm/services/users/get-user-request-by-id";

type Context = {
	params: Promise<{ id: string }>;
};

// Devuelve el detalle de una solicitud concreta.
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
		const request = await getUserRequestById(id);

		if (!request) {
			return NextResponse.json(
				{ error: "Solicitud no encontrada" },
				{ status: 404 },
			);
		}

		return NextResponse.json(request);
	} catch (error) {
		console.error("Error getting user request by id:", error);

		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

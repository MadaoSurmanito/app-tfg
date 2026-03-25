import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listUserRequests } from "@/app/lib/typeorm/services/users/list-user-requests";

// Devuelve el listado de solicitudes de alta.
// Solo los administradores pueden consultarlo.
export async function GET() {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 });
		}

		const requests = await listUserRequests();

		return NextResponse.json(requests);
	} catch (error) {
		console.error("Error listing user requests:", error);

		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getClientById } from "@/lib/typeorm/services/commercial/client";
import { canCommercialAccessClient } from "@/lib/typeorm/services/commercial/client-commercial-assignment";
import {
	CommercialProfileError,
	requireCommercialByUserId,
} from "@/lib/typeorm/services/commercial/commercial";
type RouteContext = {
	params: Promise<{
		id: string;
	}>;
};

type SessionLike = {
	user?: {
		id: string;
		role: string;
	};
} | null;

export async function GET(_: Request, context: RouteContext) {
	try {
		const session = (await auth()) as SessionLike;
		const { id } = await context.params;

		if (!session?.user) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		if (session.user.role !== "commercial") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		await requireCommercialByUserId(session.user.id);

		const allowed = await canCommercialAccessClient(session.user.id, id);

		if (!allowed) {
			return NextResponse.json(
				{ error: "Cliente no asignado a este comercial" },
				{ status: 403 },
			);
		}

		const client = await getClientById(id);

		if (!client) {
			return NextResponse.json(
				{ error: "Cliente no encontrado" },
				{ status: 404 },
			);
		}

		return NextResponse.json(client, { status: 200 });
	} catch (error) {
		console.error("[commercial/clients/[id]][GET] error:", error);

		if (error instanceof CommercialProfileError) {
			return NextResponse.json(
				{ error: error.message, code: error.code },
				{ status: error.status },
			);
		}

		return NextResponse.json(
			{ error: "Error al obtener el cliente del comercial" },
			{ status: 500 },
		);
	}
}

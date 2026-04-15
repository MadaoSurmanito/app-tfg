import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	listClients,
	listClientsByCommercialId,
} from "@/lib/typeorm/services/commercial/client";
import {
	CommercialProfileError,
	requireCommercialByUserId,
} from "@/lib/typeorm/services/commercial/commercial";

type SessionLike = {
	user?: {
		id: string;
		role: string;
	};
} | null;

export async function GET(request: Request) {
	try {
		const session = (await auth()) as SessionLike;

		if (!session?.user || session.user.role !== "commercial") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const commercial = await requireCommercialByUserId(session.user.id);
		const { searchParams } = new URL(request.url);
		const scope = searchParams.get("scope");

		const clients =
			scope === "all"
				? await listClients()
				: await listClientsByCommercialId(commercial.id);

		return NextResponse.json(clients, { status: 200 });
	} catch (error) {
		console.error("[commercial/clients][GET] error:", error);

		if (error instanceof CommercialProfileError) {
			return NextResponse.json(
				{ error: error.message, code: error.code },
				{ status: error.status },
			);
		}

		return NextResponse.json(
			{ error: "Error al obtener los clientes del comercial" },
			{ status: 500 },
		);
	}
}

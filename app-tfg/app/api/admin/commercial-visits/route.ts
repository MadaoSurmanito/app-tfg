import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	createCommercialVisit,
	listCommercialVisitsByClient,
} from "@/lib/typeorm/services/commercial/commercial-visit";

type CreateCommercialVisitBody = {
	clientId?: string;
	commercialId?: string;
	scheduledAt?: string;
	notes?: string | null;
};

export async function GET(request: Request) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const clientId = searchParams.get("clientId");

		if (!clientId) {
			return NextResponse.json(
				{ error: "clientId es obligatorio" },
				{ status: 400 },
			);
		}

		const visits = await listCommercialVisitsByClient(clientId);

		return NextResponse.json(visits, { status: 200 });
	} catch (error) {
		console.error("[admin/commercial-visits][GET] error:", error);

		return NextResponse.json(
			{ error: "Error al listar las visitas comerciales" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const body = (await request.json()) as CreateCommercialVisitBody;

		const createdVisit = await createCommercialVisit({
			clientId: String(body.clientId ?? ""),
			commercialId: String(body.commercialId ?? ""),
			scheduledAt: new Date(String(body.scheduledAt ?? "")),
			notes: body.notes ?? undefined,
		});

		return NextResponse.json(
			{
				message: "Visita comercial creada correctamente",
				visitId: createdVisit.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("[admin/commercial-visits][POST] error:", error);

		return NextResponse.json(
			{ error: "Error al crear la visita comercial" },
			{ status: 500 },
		);
	}
}

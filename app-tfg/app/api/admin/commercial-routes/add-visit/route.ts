import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addVisitToRoute } from "@/lib/typeorm/services/commercial/commercial-route";

type AddVisitToRouteBody = {
	routeId?: string;
	visitId?: string;
	order?: number;
};

// POST /api/admin/commercial-routes/add-visit
export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const body = (await request.json()) as AddVisitToRouteBody;

		const createdRouteVisit = await addVisitToRoute({
			routeId: String(body.routeId ?? ""),
			visitId: String(body.visitId ?? ""),
			order: Number(body.order ?? 0),
		});

		return NextResponse.json(
			{
				message: "Visita añadida a la ruta correctamente",
				routeVisitId: createdRouteVisit.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("[admin/commercial-routes/add-visit][POST] error:", error);

		return NextResponse.json(
			{ error: "Error al añadir la visita a la ruta" },
			{ status: 500 },
		);
	}
}
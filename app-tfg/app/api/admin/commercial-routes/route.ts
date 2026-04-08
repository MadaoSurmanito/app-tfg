import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCommercialRoute } from "@/lib/typeorm/services/commercial/commercial-route";

// Types
// Body type for creating a commercial route
type CreateCommercialRouteBody = {
	commercialId?: string;
	date?: string;
	name?: string;
};

// POST /api/admin/commercial-routes
export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const body = (await request.json()) as CreateCommercialRouteBody;

		const createdRoute = await createCommercialRoute({
			commercialId: String(body.commercialId ?? ""),
			date: String(body.date ?? ""),
			name: String(body.name ?? ""),
		});

		return NextResponse.json(
			{
				message: "Ruta comercial creada correctamente",
				routeId: createdRoute.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("[admin/commercial-routes][POST] error:", error);

		return NextResponse.json(
			{ error: "Error al crear la ruta comercial" },
			{ status: 500 },
		);
	}
}
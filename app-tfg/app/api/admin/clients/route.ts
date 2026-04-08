import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	createClient,
	CreateClientError,
	listClients,
} from "@/lib/typeorm/services/commercial/client";

// Types
// Body type for creating a client
type CreateClientBody = {
	name?: string;
	contactName?: string | null;
	taxId?: string | null;
	address?: string;
	city?: string;
	postalCode?: string | null;
	province?: string | null;
	assignedCommercialId?: string;
	linkedUserId?: string;
	notes?: string | null;
};

// GET /api/admin/clients
export async function GET() {
	try {
		const session = await auth();

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const clients = await listClients();

		return NextResponse.json(clients, { status: 200 });
	} catch (error) {
		console.error("[admin/clients][GET] error:", error);

		return NextResponse.json(
			{ error: "Error al listar los clientes" },
			{ status: 500 },
		);
	}
}

// POST /api/admin/clients
export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const body = (await request.json()) as CreateClientBody;

		const createdClient = await createClient({
			name: String(body.name ?? ""),
			contactName: body.contactName ?? null,
			taxId: body.taxId ?? null,
			address: String(body.address ?? ""),
			city: String(body.city ?? ""),
			postalCode: body.postalCode ?? null,
			province: body.province ?? null,
			assignedCommercialId: String(body.assignedCommercialId ?? ""),
			linkedUserId: String(body.linkedUserId ?? ""),
			notes: body.notes ?? null,
		});

		return NextResponse.json(
			{
				message: "Cliente creado correctamente",
				clientId: createdClient.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("[admin/clients][POST] error:", error);

		if (error instanceof CreateClientError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Error al crear el cliente" },
			{ status: 500 },
		);
	}
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { approveUserRequest } from "@/lib/typeorm/services/users/request";

type Context = {
	params: Promise<{ id: string }>;
};

type ApproveUserRequestBody = {
	commercialId?: string | null;
};

// Aprueba una solicitud concreta y crea el usuario asociado.
export async function POST(request: Request, context: Context) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 });
		}

		const { id } = await context.params;
		const body = (await request
			.json()
			.catch(() => ({}))) as ApproveUserRequestBody;

		const result = await approveUserRequest(
			id,
			session.user.id,
			body.commercialId ?? null,
		);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error approving user request:", error);

		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Error interno del servidor",
			},
			{ status: 500 },
		);
	}
}

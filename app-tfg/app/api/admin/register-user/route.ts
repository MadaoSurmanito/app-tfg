import { NextRequest, NextResponse } from "next/server";
import { createRegisterRequest } from "@/app/lib/typeorm/services/users/create-register-request";

// Endpoint público para solicitar alta en el sistema.
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const createdRequest = await createRegisterRequest({
			name: body.name,
			email: body.email,
			password: body.password,
			company: body.company ?? null,
			phone: body.phone ?? null,
			roleId: body.roleId ? Number(body.roleId) : undefined,
		});

		return NextResponse.json(createdRequest, { status: 201 });
	} catch (error) {
		console.error("Error creating register request:", error);

		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Error interno del servidor",
			},
			{ status: 500 },
		);
	}
}
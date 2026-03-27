import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listUsers, registerUserByAdmin } from "@/lib/typeorm/services/users/user";

export async function GET() {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 });
		}

		const users = await listUsers();
		return NextResponse.json(users);
	} catch (error) {
		console.error("Error listing users:", error);

		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 });
		}

		const body = await request.json();

		const createdUser = await registerUserByAdmin({
			name: body.name,
			email: body.email,
			password: body.password,
			company: body.company ?? null,
			phone: body.phone ?? null,
			roleId: Number(body.roleId),
			performedByUserId: session.user.id,
		});

		return NextResponse.json(createdUser, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);

		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Error interno del servidor",
			},
			{ status: 500 },
		);
	}
}

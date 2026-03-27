import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { changeUserPassword } from "@/lib/typeorm/services/users/password";

type Context = {
	params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: Context) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 });
		}

		const { id } = await context.params;
		const body = await request.json();

		if (!body.newPassword || typeof body.newPassword !== "string") {
			return NextResponse.json(
				{ error: "La nueva contraseña es obligatoria" },
				{ status: 400 },
			);
		}

		const result = await changeUserPassword({
			userId: id,
			newPassword: body.newPassword,
			performedByUserId: session.user.id,
			reason: body.reason ?? null,
			notes: body.notes ?? null,
			mode: "admin",
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error changing user password:", error);

		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Error interno del servidor",
			},
			{ status: 500 },
		);
	}
}
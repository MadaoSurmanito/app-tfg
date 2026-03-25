import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateUserStatus } from "@/app/lib/typeorm/services/users/update-user-status";

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

		const updatedUser = await updateUserStatus({
			userId: id,
			newStatusId: Number(body.statusId),
			performedByUserId: session.user.id,
			reason: body.reason ?? null,
			notes: body.notes ?? null,
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating user status:", error);

		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Error interno del servidor",
			},
			{ status: 500 },
		);
	}
}
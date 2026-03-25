import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	deactivateUser,
	DeactivateUserError,
} from "@/lib/typeorm/services/users/deactivate-user";

type Props = {
	params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Props) {
	const session = await auth();

	if (!session || session.user.role !== "admin") {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 });
	}

	const { id } = await params;

	try {
		await deactivateUser({
			userId: id,
			performedByUserId: session.user.id,
			performedByEmail: session.user.email,
		});

		return NextResponse.redirect(new URL("/admin/users/usuarios", request.url));
	} catch (error) {
		if (error instanceof DeactivateUserError) {
			if (error.code === "USER_NOT_FOUND") {
				return NextResponse.json({ error: error.message }, { status: 404 });
			}

			if (error.code === "SELF_DEACTIVATION_NOT_ALLOWED") {
				return NextResponse.json({ error: error.message }, { status: 400 });
			}
		}

		console.error("Error desactivando usuario:", error);

		return NextResponse.json(
			{ error: "Error al desactivar el usuario" },
			{ status: 500 },
		);
	}
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	updateUser,
	UpdateUserError,
} from "@/lib/typeorm/services/users/update-user";

type RouteContext = {
	params: Promise<{ id: string }>;
};

type UpdateUserRequestBody = {
	name?: string;
	email?: string;
	company?: string | null;
	phone?: string | null;
	profile_image_url?: string | null;
	roleId?: number;
	statusId?: number;
	password?: string;
	confirmPassword?: string;
};

export async function PATCH(request: Request, { params }: RouteContext) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ message: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ message: "No autorizado" }, { status: 403 });
		}

		if (!session.user?.id) {
			return NextResponse.json({ message: "Sesión inválida" }, { status: 401 });
		}

		const { id } = await params;
		const body = (await request.json()) as UpdateUserRequestBody;

		const result = await updateUser({
			userId: id,
			performedByUserId: session.user.id,
			name: body.name ?? "",
			email: body.email ?? "",
			company: body.company ?? null,
			phone: body.phone ?? null,
			profile_image_url: body.profile_image_url ?? null,
			roleId: Number(body.roleId),
			statusId: Number(body.statusId),
			password: body.password ?? "",
			confirmPassword: body.confirmPassword ?? "",
		});

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		if (error instanceof UpdateUserError) {
			return NextResponse.json(
				{
					message: error.message,
					code: error.code,
				},
				{ status: error.status },
			);
		}

		console.error("Error al actualizar usuario:", error);

		return NextResponse.json(
			{
				message: "Error interno del servidor",
				code: "INTERNAL_SERVER_ERROR",
			},
			{ status: 500 },
		);
	}
}

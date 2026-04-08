import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	registerUserByAdmin,
	RegisterUserByAdminError,
} from "@/lib/typeorm/services/users/user";
import { ROLE_IDS } from "@/lib/typeorm/constants/catalog-ids";

type RegisterUserBody = {
	name?: string;
	email?: string;
	password?: string;
	company?: string | null;
	phone?: string | null;
	type?: string;
};

function resolveRoleIdFromType(type: string | undefined) {
	if (type === "comercial") {
		return ROLE_IDS.COMMERCIAL;
	}

	if (type === "cliente") {	
		return ROLE_IDS.CLIENT;
	}

	return 0;
}

export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const body = (await request.json()) as RegisterUserBody;

		const roleId = resolveRoleIdFromType(body.type);

		const createdUser = await registerUserByAdmin({
			name: String(body.name ?? ""),
			email: String(body.email ?? ""),
			password: String(body.password ?? ""),
			company: body.company ?? null,
			phone: body.phone ?? null,
			roleId,
			performedByUserId: session.user.id,
		});

		if (!createdUser) {
			return NextResponse.json(
				{ error: "No se pudo recuperar el usuario creado" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				message: "Usuario creado correctamente",
				userId: createdUser.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("[admin/register-user] error:", error);

		if (error instanceof RegisterUserByAdminError) {
			return NextResponse.json(
				{ error: error.message, code: error.code },
				{ status: error.status },
			);
		}

		return NextResponse.json(
			{ error: "Error al crear el usuario" },
			{ status: 500 },
		);
	}
}

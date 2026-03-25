import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDataSource } from "@/lib/typeorm/data-source";
import { User } from "@/lib/typeorm/entities/User";

type UpdateProfileRequestBody = {
	name?: string;
	company?: string | null;
	phone?: string | null;
	profile_image_url?: string | null;
};

function normalizeText(value: string | null | undefined) {
	return String(value ?? "").trim();
}

export async function PATCH(request: Request) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ message: "No autenticado" }, { status: 401 });
		}

		if (!session.user?.id) {
			return NextResponse.json({ message: "Sesión inválida" }, { status: 401 });
		}

		const body = (await request.json()) as UpdateProfileRequestBody;

		const name = normalizeText(body.name);
		const company = normalizeText(body.company) || null;
		const phone = normalizeText(body.phone) || null;
		const profileImageUrl = normalizeText(body.profile_image_url) || null;

		if (!name) {
			return NextResponse.json(
				{
					message: "El nombre es obligatorio",
					code: "INVALID_NAME",
				},
				{ status: 400 },
			);
		}

		const ds = await getDataSource();
		const userRepo = ds.getRepository(User);

		const user = await userRepo.findOne({
			where: { id: session.user.id },
		});

		if (!user) {
			return NextResponse.json(
				{
					message: "Usuario no encontrado",
					code: "USER_NOT_FOUND",
				},
				{ status: 404 },
			);
		}

		user.name = name;
		user.company = company;
		user.phone = phone;
		user.profile_image_url = profileImageUrl;
		user.updated_at = new Date();

		await userRepo.save(user);

		return NextResponse.json(
			{
				message: "Perfil actualizado correctamente",
				userId: user.id,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error al actualizar el perfil:", error);

		return NextResponse.json(
			{
				message: "Error interno del servidor",
				code: "INTERNAL_SERVER_ERROR",
			},
			{ status: 500 },
		);
	}
}
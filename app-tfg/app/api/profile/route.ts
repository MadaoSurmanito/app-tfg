
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPasswordValidationMessage } from "@/lib/password";
import { getDataSource } from "@/lib/typeorm/data-source";
import { User } from "@/lib/typeorm/entities/User";

type UpdateProfileRequestBody = {
	name?: string;
	company?: string | null;
	phone?: string | null;
	profile_image_url?: string | null;
	password?: string;
	confirmPassword?: string;
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
		const password = String(body.password ?? "");
		const confirmPassword = String(body.confirmPassword ?? "");

		if (!name) {
			return NextResponse.json(
				{
					message: "El nombre es obligatorio",
					code: "INVALID_NAME",
				},
				{ status: 400 },
			);
		}

		if (password || confirmPassword) {
			if (password !== confirmPassword) {
				return NextResponse.json(
					{
						message: "Las contraseñas no coinciden",
						code: "PASSWORD_MATCH",
					},
					{ status: 400 },
				);
			}

			const passwordValidationMessage = getPasswordValidationMessage(password);

			if (passwordValidationMessage) {
				return NextResponse.json(
					{
						message: passwordValidationMessage,
						code: "PASSWORD_RULES",
					},
					{ status: 400 },
				);
			}
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

		if (password) {
			user.password_hash = await bcrypt.hash(password, 10);
		}

		user.updated_at = new Date();

		await userRepo.save(user);

		return NextResponse.json(
			{
				message: password
					? "Perfil y contraseña actualizados correctamente"
					: "Perfil actualizado correctamente",
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

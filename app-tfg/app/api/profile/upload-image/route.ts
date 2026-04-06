import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	uploadProfileImage,
	deleteImageByPublicId,
	extractPublicIdFromUrl,
} from "@/lib/cloudinary";
import { getDataSource } from "@/lib/typeorm/data-source";
import { User } from "@/lib/typeorm/entities/User";

export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ message: "No autenticado", code: "UNAUTHORIZED" },
				{ status: 401 },
			);
		}

		const formData = await request.formData();
		const file = formData.get("file");

		if (!(file instanceof File)) {
			return NextResponse.json(
				{ message: "No se ha enviado ningún archivo", code: "FILE_REQUIRED" },
				{ status: 400 },
			);
		}

		if (!file.type.startsWith("image/")) {
			return NextResponse.json(
				{
					message: "El archivo debe ser una imagen",
					code: "INVALID_FILE_TYPE",
				},
				{ status: 400 },
			);
		}

		const maxSizeInBytes = 5 * 1024 * 1024;

		if (file.size > maxSizeInBytes) {
			return NextResponse.json(
				{ message: "La imagen no puede superar 5 MB", code: "FILE_TOO_LARGE" },
				{ status: 400 },
			);
		}

		const ds = await getDataSource();
		const userRepo = ds.getRepository(User);

		const user = await userRepo.findOne({
			where: { id: session.user.id },
		});

		const previousPublicId = extractPublicIdFromUrl(
			user?.profile_image_url,
		);

		// Convertimos a base64
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

		// Subida
		const uploadResult = await uploadProfileImage(base64File);

		// Borrado anterior (si existe)
		if (previousPublicId && previousPublicId !== uploadResult.public_id) {
			try {
				await deleteImageByPublicId(previousPublicId);
			} catch (err) {
				console.error("Error borrando imagen anterior:", err);
			}
		}

		return NextResponse.json(
			{
				message: "Imagen subida correctamente",
				imageUrl: uploadResult.secure_url,
				publicId: uploadResult.public_id,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error al subir imagen de perfil:", error);

		return NextResponse.json(
			{
				message: "No se pudo subir la imagen",
				code: "UPLOAD_IMAGE_ERROR",
			},
			{ status: 500 },
		);
	}
}
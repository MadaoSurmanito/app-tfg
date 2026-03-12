import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// Ruta para rechazar una solicitud de registro
export async function POST(request: Request, { params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.redirect(
			new URL("/login", process.env.AUTH_URL ?? "http://localhost:3000"),
		);
	}

	const { id } = await params;

	try {
		const formData = await request.formData();
		const rejectionReason = String(
			formData.get("rejection_reason") ?? "",
		).trim();

		const result = await pool.query(
			`
				UPDATE user_requests
				SET
					status = 'rechazada',
					reviewed_at = NOW(),
					reviewed_by = $1,
					rejection_reason = $2,
					approved_user_id = NULL
				WHERE id = $3
				  AND status = 'pendiente'
				RETURNING id
			`,
			[session.user.id, rejectionReason || null, id],
		);

		if ((result.rowCount ?? 0) === 0) {
			return NextResponse.redirect(
				new URL(
					"/admin/solicitudes?error=no-encontrada",
					process.env.AUTH_URL ?? "http://localhost:3000",
				),
			);
		}

		return NextResponse.redirect(
			new URL(
				"/admin/solicitudes?success=rechazada",
				process.env.AUTH_URL ?? "http://localhost:3000",
			),
		);
	} catch (error) {
		console.error("Error al rechazar solicitud:", error);

		return NextResponse.redirect(
			new URL(
				"/admin/solicitudes?error=server",
				process.env.AUTH_URL ?? "http://localhost:3000",
			),
		);
	}
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// Ruta para rechazar una solicitud
export async function POST(request: Request, { params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const { id } = await params;

	try {
		const formData = await request.formData();
		const rejectionReason = String(
			formData.get("rejection_reason") ?? "",
		).trim();

		// Resolver el estado rechazada
		const rejectedStatusResult = await pool.query(
			`
				SELECT id
				FROM request_statuses
				WHERE code = 'rejected'
				LIMIT 1
			`,
		);

		const rejectedStatusId = rejectedStatusResult.rows[0]?.id;

		if (!rejectedStatusId) {
			return NextResponse.redirect(
				new URL("/admin/users/solicitudes?error=server", request.url),
			);
		}

		// Actualizar la solicitud si sigue pendiente
		const result = await pool.query(
			`
				UPDATE user_requests
				SET
					status_id = $1,
					reviewed_at = NOW(),
					reviewed_by = $2,
					rejection_reason = $3,
					created_user_id = NULL
				WHERE id = $4
				  AND status_id = (
						SELECT id
						FROM request_statuses
						WHERE code = 'pending'
				  )
				RETURNING id
			`,
			[rejectedStatusId, session.user.id, rejectionReason || null, id],
		);

		if ((result.rowCount ?? 0) === 0) {
			return NextResponse.redirect(
				new URL("/admin/users/solicitudes?error=no-encontrada", request.url),
			);
		}

		return NextResponse.redirect(
			new URL("/admin/users/solicitudes?success=rechazada", request.url),
		);
	} catch (error) {
		console.error("Error al rechazar solicitud:", error);

		return NextResponse.redirect(
			new URL("/admin/users/solicitudes?error=server", request.url),
		);
	}
}

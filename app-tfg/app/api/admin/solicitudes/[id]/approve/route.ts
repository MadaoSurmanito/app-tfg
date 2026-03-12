import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// Ruta para aprobar una solicitud de registro
export async function POST(_: Request, { params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		return NextResponse.redirect(
			new URL("/login", process.env.AUTH_URL ?? "http://localhost:3000"),
		);
	}

	const { id } = await params;
	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const requestResult = await client.query(
			`
				SELECT id, name, email, company, phone, password_hash, status
				FROM user_requests
				WHERE id = $1
				FOR UPDATE
			`,
			[id],
		);

		const solicitud = requestResult.rows[0];

		if (!solicitud) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL(
					"/admin/solicitudes?error=no-encontrada",
					process.env.AUTH_URL ?? "http://localhost:3000",
				),
			);
		}

		if (solicitud.status !== "pendiente") {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL(
					"/admin/solicitudes?error=ya-revisada",
					process.env.AUTH_URL ?? "http://localhost:3000",
				),
			);
		}

		const existingUser = await client.query(
			`
				SELECT id
				FROM users
				WHERE lower(email) = lower($1)
				LIMIT 1
			`,
			[solicitud.email],
		);

		if ((existingUser.rowCount ?? 0) > 0) {
			await client.query("ROLLBACK");
			return NextResponse.redirect(
				new URL(
					"/admin/solicitudes?error=usuario-existe",
					process.env.AUTH_URL ?? "http://localhost:3000",
				),
			);
		}

		const insertUserResult = await client.query(
			`
				INSERT INTO users (
					name,
					email,
					company,
					phone,
					password_hash,
					role,
					image_url,
					created_at
				)
				VALUES ($1, $2, $3, $4, $5, 'cliente', NULL, NOW())
				RETURNING id
			`,
			[
				solicitud.name,
				solicitud.email,
				solicitud.company,
				solicitud.phone,
				solicitud.password_hash,
			],
		);

		const newUserId = insertUserResult.rows[0].id;

		await client.query(
			`
				UPDATE user_requests
				SET
					status = 'aprobada',
					reviewed_at = NOW(),
					reviewed_by = $1,
					approved_user_id = $2,
					rejection_reason = NULL
				WHERE id = $3
			`,
			[session.user.id, newUserId, id],
		);

		await client.query("COMMIT");

		return NextResponse.redirect(
			new URL(
				"/admin/solicitudes?success=aprobada",
				process.env.AUTH_URL ?? "http://localhost:3000",
			),
		);
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error al aprobar solicitud:", error);

		return NextResponse.redirect(
			new URL(
				"/admin/solicitudes?error=server",
				process.env.AUTH_URL ?? "http://localhost:3000",
			),
		);
	} finally {
		client.release();
	}
}

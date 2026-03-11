import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import bcrypt from "bcryptjs";

type RegisterRequestBody = {
	email?: string;
	name?: string;
	company?: string;
	phone?: string;
	password?: string;
};

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as RegisterRequestBody;

		const email = String(body.email ?? "")
			.trim()
			.toLowerCase();
		const name = String(body.name ?? "").trim();
		const company = String(body.company ?? "").trim();
		const phone = String(body.phone ?? "").trim();
		const password = String(body.password ?? "");

		if (!email || !name || !company || !password) {
			return NextResponse.json(
				{ message: "Faltan campos obligatorios" },
				{ status: 400 },
			);
		}

		// 2) Longitudes máximas (para evitar abusos y errores)
		const maxLengths = { name: 120, company: 120, phone: 30, password: 100 };
		const fieldLabels = {
			name: "El nombre",
			company: "El nombre de la empresa",
			phone: "El teléfono",
			password: "La contraseña",
		};

		for (const [field, max] of Object.entries(maxLengths)) {
			if (eval(field).length > max) {
				return NextResponse.json(
					{
						message: `${fieldLabels[field as keyof typeof fieldLabels]} es demasiado largo`,
					},
					{ status: 400 },
				);
			}
		}

		// 3) Formato email
		if (!EMAIL_REGEX.test(email) || (phone && !PHONE_REGEX.test(phone))) {
			const field = !EMAIL_REGEX.test(email)
				? "correo electrónico"
				: "teléfono";
			return NextResponse.json(
				{ message: `El ${field} no tiene un formato válido` },
				{ status: 400 },
			);
		}

		// 5) Comprobar si ya existe como usuario real
		let existingUser;
		try {
			existingUser = await pool.query(
				`
					SELECT id
					FROM users
					WHERE lower(email) = lower($1)
					LIMIT 1
				`,
				[email],
			);
		} catch (dbError) {
			console.error("Database connection error:", dbError);
			throw dbError;
		}

		if ((existingUser.rowCount ?? 0) > 0) {
			return NextResponse.json(
				{ message: "Ya existe una cuenta con ese correo" },
				{ status: 409 },
			);
		}

		// 6) Comprobar si ya existe una solicitud pendiente
		const existingPendingRequest = await pool.query(
			`
				SELECT id
				FROM user_requests
				WHERE lower(email) = lower($1)
				  AND status = 'pendiente'
				LIMIT 1
			`,
			[email],
		);

		if ((existingPendingRequest.rowCount ?? 0) > 0) {
			return NextResponse.json(
				{ message: "Ya existe una solicitud pendiente para este correo" },
				{ status: 409 },
			);
		}

		// 7) Si todo es correcto, insertar la solicitud en la base de datos
		const passwordHash = await bcrypt.hash(password, 10);

		await pool.query(
			`
				INSERT INTO user_requests (
					name,
					email,
					company,
					phone,
					password_hash,
					status,
					requested_at
				)
				VALUES ($1, $2, $3, $4, $5, 'pendiente', NOW())
			`,
			[name, email, company, phone || null, passwordHash],
		);

		return NextResponse.json(
			{ message: "Solicitud enviada correctamente" },
			{ status: 201 },
		);
	} catch (error: unknown) {
		console.error("Error en /api/auth/register-request:", error);

		// Error típico de restricción única en PostgreSQL
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			error.code === "23505"
		) {
			return NextResponse.json(
				{ message: "Ya existe una solicitud pendiente para este correo" },
				{ status: 409 },
			);
		}

		// Error típico de CHECK constraint en PostgreSQL
		if (
			typeof error === "object" &&
			error !== null &&
			"code" in error &&
			error.code === "23514"
		) {
			return NextResponse.json(
				{ message: "Los datos enviados no son válidos" },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ message: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

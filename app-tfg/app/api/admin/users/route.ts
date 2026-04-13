import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
	listUsers,
	listUsersPaginated,
	registerUserByAdmin,
} from "@/lib/typeorm/services/users/user";

// -----------------------------------------------------------------------------
// HELPERS DE PAGINACIÓN
// -----------------------------------------------------------------------------
// Normaliza un entero positivo a partir de un query param.
// Si el valor no es válido, devuelve el fallback indicado.
function parsePositiveInteger(
	value: string | null,
	fallback: number,
	max?: number,
) {
	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		return fallback;
	}

	if (typeof max === "number") {
		return Math.min(parsed, max);
	}

	return parsed;
}

export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 });
		}

		// ---------------------------------------------------------------------
		// LISTADO LEGACY + LISTADO PAGINADO OPCIONAL
		// ---------------------------------------------------------------------
		// Mantenemos el comportamiento antiguo si no se pasan parámetros,
		// pero permitimos ya usar paginación y búsqueda de forma opcional
		// para abaratar este endpoint en llamadas futuras.
		const pageParam = request.nextUrl.searchParams.get("page");
		const pageSizeParam = request.nextUrl.searchParams.get("pageSize");
		const searchParam = request.nextUrl.searchParams.get("search");

		const shouldUsePagination =
			pageParam !== null || pageSizeParam !== null || searchParam !== null;

		if (shouldUsePagination) {
			const page = parsePositiveInteger(pageParam, 1);
			const pageSize = parsePositiveInteger(pageSizeParam, 20, 50);
			const search = searchParam?.trim() || undefined;

			const result = await listUsersPaginated({
				page,
				pageSize,
				search,
			});

			return NextResponse.json(result);
		}

		const users = await listUsers();
		return NextResponse.json(users);
	} catch (error) {
		console.error("Error listing users:", error);

		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session) {
			return NextResponse.json({ error: "No autenticado" }, { status: 401 });
		}

		if (session.user?.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 403 });
		}

		const body = await request.json();

		const createdUser = await registerUserByAdmin({
			name: body.name,
			email: body.email,
			password: body.password,
			company: body.company ?? null,
			phone: body.phone ?? null,
			roleId: Number(body.roleId),
			performedByUserId: session.user.id,
		});

		return NextResponse.json(createdUser, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);

		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Error interno del servidor",
			},
			{ status: 500 },
		);
	}
}

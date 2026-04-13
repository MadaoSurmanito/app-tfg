import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
	assignClientToCommercial,
	ClientCommercialAssignmentError,
	getActiveAssignmentByClientId,
	listActiveAssignmentsByCommercialId,
	reassignClientToCommercial,
	unassignClientFromCommercial,
} from "@/lib/typeorm/services/commercial/client-commercial-assignment";

type SessionUser = {
	id: string;
	role: string;
};

type SessionLike = {
	user?: SessionUser;
} | null;

type AdminSession = {
	user: SessionUser & {
		role: "admin";
	};
};

type AssignmentBody = {
	mode?: "assign" | "reassign" | "unassign";
	clientId?: string;
	commercialId?: string;
	notes?: string | null;
};

function isAdmin(session: SessionLike): session is AdminSession {
	return session?.user?.role === "admin";
}

export async function GET(request: Request) {
	try {
		const session = (await auth()) as SessionLike;

		if (!isAdmin(session)) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const clientId = searchParams.get("clientId");
		const commercialId = searchParams.get("commercialId");

		if (clientId) {
			const assignment = await getActiveAssignmentByClientId(clientId);

			return NextResponse.json(assignment, { status: 200 });
		}

		if (commercialId) {
			const assignments = await listActiveAssignmentsByCommercialId(commercialId);

			return NextResponse.json(assignments, { status: 200 });
		}

		return NextResponse.json(
			{ error: "Debes indicar clientId o commercialId" },
			{ status: 400 },
		);
	} catch (error) {
		console.error("[admin/client-commercial-assignments][GET] error:", error);

		return NextResponse.json(
			{ error: "Error al obtener asignaciones comerciales" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = (await auth()) as SessionLike;

		if (!isAdmin(session)) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const body = (await request.json()) as AssignmentBody;

		if (!body.clientId) {
			return NextResponse.json(
				{ error: "clientId es obligatorio" },
				{ status: 400 },
			);
		}

		if (body.mode === "unassign") {
			const assignment = await unassignClientFromCommercial({
				clientId: body.clientId,
				unassignedByUserId: session.user.id,
				notes: body.notes,
			});

			return NextResponse.json(assignment, { status: 200 });
		}

		if (!body.commercialId) {
			return NextResponse.json(
				{ error: "commercialId es obligatorio" },
				{ status: 400 },
			);
		}

		if (body.mode === "reassign") {
			const assignment = await reassignClientToCommercial({
				clientId: body.clientId,
				commercialId: body.commercialId,
				assignedByUserId: session.user.id,
				notes: body.notes,
			});

			return NextResponse.json(assignment, { status: 200 });
		}

		const assignment = await assignClientToCommercial({
			clientId: body.clientId,
			commercialId: body.commercialId,
			assignedByUserId: session.user.id,
			notes: body.notes,
		});

		return NextResponse.json(assignment, { status: 201 });
	} catch (error) {
		console.error("[admin/client-commercial-assignments][POST] error:", error);

		if (error instanceof ClientCommercialAssignmentError) {
			return NextResponse.json(
				{ error: error.message, code: error.code },
				{ status: error.status },
			);
		}

		return NextResponse.json(
			{ error: "Error al guardar la asignación comercial" },
			{ status: 500 },
		);
	}
}
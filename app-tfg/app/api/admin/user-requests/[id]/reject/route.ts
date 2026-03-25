import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rejectUserRequest } from "@/app/lib/typeorm/services/users/reject-user-request";

type Props = {
	params: Promise<{ id: string }>;
};

async function getReasonFromRequest(request: Request) {
	const contentType = request.headers.get("content-type") ?? "";

	if (contentType.includes("application/json")) {
		const body = await request.json().catch(() => ({}));
		return String(body?.reason ?? "").trim();
	}

	if (
		contentType.includes("application/x-www-form-urlencoded") ||
		contentType.includes("multipart/form-data")
	) {
		const formData = await request.formData();
		return String(formData.get("reason") ?? "").trim();
	}

	return "";
}

export async function POST(request: Request, { params }: Props) {
	try {
		const session = await auth();

		if (!session || session.user.role !== "admin") {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		const { id } = await params;
		const reason = await getReasonFromRequest(request);

		if (!reason) {
			return NextResponse.json(
				{ error: "Debes indicar un motivo de rechazo" },
				{ status: 400 },
			);
		}

		await rejectUserRequest(id, session.user.id, reason);

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("Error rejecting user request:", error);

		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Error al rechazar la solicitud" },
			{ status: 500 },
		);
	}
}

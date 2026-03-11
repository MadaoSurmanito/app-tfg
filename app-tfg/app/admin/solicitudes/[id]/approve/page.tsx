import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import HeaderTitle from "@/app/components/HeaderTitle";
import Link from "next/link";
import SolicitudReviewCard from "@/app/components/SolicitudReviewCard";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// En esta página se muestra el detalle de una solicitud de registro pendiente, solo accesible para el admin. Desde aquí se puede aprobar o rechazar la solicitud.
export default async function ApproveSolicitudPage({ params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	const { id } = await params;

	const result = await pool.query(
		`
			SELECT id, email, name, company, phone, requested_at, status
			FROM user_requests
			WHERE id = $1
			LIMIT 1
		`,
		[id],
	);

	const solicitud = result.rows[0];

	if (!solicitud) {
		notFound();
	}

	if (solicitud.status !== "pendiente") {
		redirect("/admin/solicitudes");
	}

	return (
		<>
			<HeaderTitle title="Aprobar solicitud" noGlass />

			<SolicitudReviewCard
				title="¿Desea aprobar a este usuario?"
				description="Revise los datos antes de confirmar la aprobación."
				solicitud={solicitud}
				actionLabel="Confirmar aprobación"
				actionHref={`/api/admin/solicitudes/${solicitud.id}/approve`}
				actionColor="green"
			/>
		</>
	);
}

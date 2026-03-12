import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import HeaderTitle from "@/app/components/HeaderTitle";
import SolicitudReviewCard from "@/app/components/SolicitudReviewCard";
import Link from "next/link";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// En esta página se muestra el detalle de una solicitud de registro pendiente, solo accesible para el admin. Desde aquí se puede rechazar la solicitud.
export default async function RejectSolicitudPage({ params }: Props) {
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
			<HeaderTitle title="Rechazar solicitud" />

			<SolicitudReviewCard
				title="¿Desea rechazar esta solicitud?"
				description="Puede indicar un motivo para dejar constancia de la decisión."
				solicitud={solicitud}
				actionLabel="Confirmar rechazo"
				actionHref={`/api/admin/solicitudes/${solicitud.id}/reject`}
				actionColor="red"
				showRejectionReason
			/>
		</>
	);
}

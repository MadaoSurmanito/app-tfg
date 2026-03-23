import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import HeaderTitle from "@/app/components/HeaderTitle";
import SolicitudReviewCard from "@/app/components/SolicitudReviewCard";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// Vista de aprobación de una solicitud
export default async function ApproveSolicitudPage({ params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	const { id } = await params;

	const result = await pool.query(
		`
			SELECT
				ur.id,
				ur.email,
				ur.name,
				ur.company,
				ur.phone,
				ur.requested_at,
				rs.code AS status_code
			FROM user_requests ur
			INNER JOIN request_statuses rs
				ON rs.id = ur.status_id
			WHERE ur.id = $1
			LIMIT 1
		`,
		[id],
	);

	const solicitud = result.rows[0];

	if (!solicitud) {
		notFound();
	}

	if (solicitud.status_code !== "pending") {
		redirect("/admin/users/solicitudes");
	}

	return (
		<>
			<HeaderTitle title="Aprobar solicitud" />

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

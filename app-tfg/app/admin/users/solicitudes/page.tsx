import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import H1Title from "@/app/components/H1Title";
import DataTable from "@/app/components/DataTable";
import PageTransition from "@/app/components/PageTransition";
import Link from "next/link";
type Solicitud = {
	id: string;
	name: string;
	email: string;
	company: string;
	phone?: string | null;
	requested_at: string;
	requested_role_name: string;
};

type Props = {
	solicitudes: Solicitud[];
};

// Lista de solicitudes pendientes
export default async function SolicitudesPage() {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	const result = await pool.query<Solicitud>(
		`
			SELECT
				ur.id,
				ur.email,
				ur.name,
				ur.company,
				ur.phone,
				ur.requested_at,
				r.name AS requested_role_name
			FROM user_requests ur
			INNER JOIN request_statuses rs
				ON rs.id = ur.status_id
			INNER JOIN roles r
				ON r.id = ur.requested_role_id
			WHERE rs.code = 'pending'
			ORDER BY ur.requested_at DESC
		`,
	);

	const solicitudes = result.rows;

	const columns = [
		{
			key: "name",
			header: "Nombre",
			render: (solicitud: Solicitud) => solicitud.name,
		},
		{
			key: "email",
			header: "Correo",
			render: (solicitud: Solicitud) => solicitud.email,
		},
		{
			key: "company",
			header: "Empresa",
			render: (solicitud: Solicitud) => solicitud.company,
		},
		{
			key: "phone",
			header: "Teléfono",
			render: (solicitud: Solicitud) => solicitud.phone || "-",
		},
		{
			key: "requested_role_name",
			header: "Rol solicitado",
			render: (solicitud: Solicitud) => solicitud.requested_role_name,
		},
		{
			key: "requested_at",
			header: "Fecha de solicitud",
			render: (solicitud: Solicitud) =>
				new Date(solicitud.requested_at).toLocaleDateString("es-ES"),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (solicitud: Solicitud) => (
				<div className="flex gap-2">
					<Link
						className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
						href={`/admin/users/solicitudes/${solicitud.id}/approve`}
					>
						Aprobar
					</Link>
					<Link
						className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
						href={`/admin/users/solicitudes/${solicitud.id}/reject`}
					>
						Rechazar
					</Link>
				</div>
			),
		},
	];

	return (
		<>
			<PageTransition>
				<H1Title
					title="Solicitudes de registro"
					subtitle="Lista de solicitudes pendientes"
				/>

				<div className="mx-auto mt-6 w-full max-w-6xl">
					<DataTable
						data={solicitudes}
						columns={columns}
						getRowKey={(solicitud) => solicitud.id}
						emptyMessage="No hay solicitudes pendientes."
					/>
				</div>
			</PageTransition>
		</>
	);
}

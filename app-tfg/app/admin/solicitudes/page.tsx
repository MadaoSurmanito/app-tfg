import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import HeaderTitle from "@/app/components/HeaderTitle";
import DataTable from "@/app/components/DataTable";

type Solicitud = {
	id: string;
	name: string;
	email: string;
	company: string;
	phone?: string | null;
	requested_at: string;
};

type Props = {
	solicitudes: Solicitud[];
};

// En esta página se muestra la lista de solicitudes de registro pendientes, solo accesible para el admin. Desde aquí se puede acceder a la aprobación o rechazo de cada solicitud.
export default async function SolicitudesPage() {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	const result = await pool.query(
		`
			SELECT id, email, name, company, phone, requested_at
			FROM user_requests
			WHERE status = 'pendiente'
			ORDER BY requested_at DESC
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
					<a
						className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
						href={`/admin/solicitudes/${solicitud.id}/approve`}
					>
						Aprobar
					</a>
					<a
						className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
						href={`/admin/solicitudes/${solicitud.id}/reject`}
					>
						Rechazar
					</a>
				</div>
			),
		},
	];

	return (
		<>
			<HeaderTitle title="Solicitudes de registro" />

			<div className="mx-auto mt-6 w-full max-w-6xl">
				<DataTable
					data={solicitudes}
					columns={columns}
					getRowKey={(solicitud) => solicitud.id}
					emptyMessage="No hay solicitudes pendientes."
				/>
			</div>
		</>
	);
}

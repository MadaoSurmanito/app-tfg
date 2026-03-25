import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import H1Title from "@/app/components/H1Title";
import DataTable from "@/app/components/DataTable";
import PageTransition from "@/app/components/PageTransition";
import { listUserRequests } from "@/lib/typeorm/services/users/list-user-requests";

type Solicitud = {
	id: string;
	name: string;
	email: string;
	company: string | null;
	phone?: string | null;
	requested_at: string;
	requested_role_name: string;
};

type Props = {
	solicitudes: Solicitud[];
};

// Lista de solicitudes pendientes.
// Esta página es un Server Component, así que consulta directamente
// la capa de servicios TypeORM sin pasar por fetch a la API interna.
export default async function SolicitudesPage() {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	// Obtenemos todas las solicitudes con sus relaciones y después
	// filtramos en servidor solo las pendientes para la tabla.
	const rawRequests = await listUserRequests();

	const solicitudes: Solicitud[] = rawRequests
		.filter((request) => request.status.code === "pending")
		.map((request) => ({
			id: request.id,
			name: request.name,
			email: request.email,
			company: request.company,
			phone: request.phone,
			requested_at: request.requested_at.toISOString(),
			requested_role_name: request.requestedRole.name,
		}));

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
			render: (solicitud: Solicitud) => solicitud.company || "-",
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
				<Link
					className="rounded bg-sky-600 px-3 py-1 text-white hover:bg-sky-700"
					href={`/admin/users/solicitudes/${solicitud.id}`}
				>
					Revisar
				</Link>
			),
		},
	];

	return (
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
	);
}

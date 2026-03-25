import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import HeaderTitle from "@/app/components/basics/HeaderTitle";
import { getUserRequestById } from "@/lib/typeorm/services/users/get-user-request-by-id";
import SolicitudActions from "./SolicitudActions";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

// Pantalla única de revisión de solicitud.
// Carga los datos en servidor y delega las acciones en un componente cliente.
export default async function ReviewSolicitudPage({ params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	const { id } = await params;
	const solicitud = await getUserRequestById(id);

	if (!solicitud) {
		notFound();
	}

	// Solo permitimos revisar solicitudes pendientes.
	if (solicitud.status.code !== "pending") {
		redirect("/admin/users/solicitudes");
	}

	return (
		<>
			<HeaderTitle
				title="Revisar solicitud"
				subtitle="Revise los datos y decida si desea aprobar o rechazar la solicitud."
			/>

			<div className="mx-auto mt-6 w-full max-w-4xl space-y-6">
				<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Nombre
							</p>
							<p className="mt-1 text-sm text-slate-800">{solicitud.name}</p>
						</div>

						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Correo
							</p>
							<p className="mt-1 text-sm text-slate-800">{solicitud.email}</p>
						</div>

						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Empresa
							</p>
							<p className="mt-1 text-sm text-slate-800">
								{solicitud.company || "-"}
							</p>
						</div>

						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Teléfono
							</p>
							<p className="mt-1 text-sm text-slate-800">
								{solicitud.phone || "-"}
							</p>
						</div>

						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Rol solicitado
							</p>
							<p className="mt-1 text-sm text-slate-800">
								{solicitud.requestedRole.name}
							</p>
						</div>

						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Fecha de solicitud
							</p>
							<p className="mt-1 text-sm text-slate-800">
								{solicitud.requested_at.toLocaleString("es-ES")}
							</p>
						</div>
					</div>
				</div>

				<SolicitudActions solicitudId={solicitud.id} />
			</div>
		</>
	);
}

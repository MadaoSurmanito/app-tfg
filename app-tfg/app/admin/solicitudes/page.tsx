import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import HeaderTitle from "@/app/components/HeaderTitle";

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

	return (
		<>
			<HeaderTitle title="Solicitudes de registro" noGlass />
			
			<div className="mx-auto mt-6 w-full max-w-6xl">
				<div className="overflow-hidden rounded-2xl bg-white shadow-md">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
										Nombre
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
										Correo
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
										Empresa
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
										Teléfono
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
										Fecha de solicitud
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
										Acciones
									</th>
								</tr>
							</thead>

							<tbody className="divide-y divide-gray-200 bg-white">
								{solicitudes.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className="px-6 py-8 text-center text-sm text-slate-500"
										>
											No hay solicitudes pendientes.
										</td>
									</tr>
								) : (
									solicitudes.map((solicitud) => (
										<tr key={solicitud.id}>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
												{solicitud.name}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
												{solicitud.email}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
												{solicitud.company}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
												{solicitud.phone || "-"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
												{new Date(solicitud.requested_at).toLocaleDateString(
													"es-ES",
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
												<a
													className="mr-2 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
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
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
}

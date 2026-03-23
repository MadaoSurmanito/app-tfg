"use client";

import Link from "next/link";
import {
	formatDateShort,
	getRoleClassesLight,
	getRoleLabel,
	getStatusClassesLight,
	getStatusLabel,
	type SortDirection,
	type SortField,
	type Usuario,
} from "./users-table-utils";

type Props = {
	filteredAndSortedUsers: Usuario[];
	sortField: SortField;
	sortDirection: SortDirection;
	handleSort: (field: SortField) => void;
};

const visibleFields: { key: SortField; label: string; className?: string }[] = [
	{ key: "name", label: "Nombre", className: "w-[13%]" },
	{ key: "email", label: "Correo", className: "w-[18%]" },
	{ key: "company", label: "Empresa", className: "w-[13%]" },
	{ key: "phone", label: "Teléfono", className: "w-[11%]" },
	{ key: "role", label: "Rol", className: "w-[10%]" },
	{ key: "status", label: "Estado", className: "w-[10%]" },
	{ key: "profile_image_url", label: "Imagen", className: "w-[8%]" },
	{ key: "created_at", label: "Alta", className: "w-[8%]" },
	{ key: "last_login_at", label: "Último login", className: "w-[9%]" },
];

export function UsersTableView({
	filteredAndSortedUsers,
	sortField,
	sortDirection,
	handleSort,
}: Props) {
	return (
		<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
			<div className="max-h-[420px] overflow-y-auto">
				<table className="w-full border-separate border-spacing-0 text-sm text-slate-700">
					<thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase tracking-wide text-slate-500">
						<tr>
							{visibleFields.map((field) => (
								<th
									key={field.key}
									className={`bg-gray-100 px-4 py-4 text-left font-semibold ${field.className ?? ""}`}
								>
									<button
										type="button"
										onClick={() => handleSort(field.key)}
										className="flex items-center gap-1 transition hover:text-slate-800"
									>
										<span>{field.label}</span>
										{sortField === field.key && (
											<span>{sortDirection === "asc" ? "↑" : "↓"}</span>
										)}
									</button>
								</th>
							))}
							<th className="sticky top-0 w-[20%] bg-gray-100 px-4 py-4 text-left font-semibold">
								Acciones
							</th>
						</tr>
					</thead>

					<tbody>
						{filteredAndSortedUsers.length === 0 ? (
							<tr>
								<td
									colSpan={visibleFields.length + 1}
									className="px-4 py-10 text-center text-slate-500"
								>
									No hay usuarios que coincidan con los filtros.
								</td>
							</tr>
						) : (
							filteredAndSortedUsers.map((usuario) => (
								<tr key={usuario.id} className="transition hover:bg-gray-50">
									<td className="border-t border-gray-200 px-4 py-3 font-medium text-slate-800">
										{usuario.name}
									</td>

									<td className="border-t border-gray-200 px-4 py-3 text-slate-700">
										{usuario.email}
									</td>

									<td className="border-t border-gray-200 px-4 py-3 text-slate-700">
										{usuario.company || "-"}
									</td>

									<td className="border-t border-gray-200 px-4 py-3 whitespace-nowrap">
										{usuario.phone || "-"}
									</td>

									<td className="border-t border-gray-200 px-4 py-3">
										<span
											className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleClassesLight(usuario.role)}`}
										>
											{getRoleLabel(usuario.role)}
										</span>
									</td>

									<td className="border-t border-gray-200 px-4 py-3">
										<span
											className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassesLight(usuario.status)}`}
										>
											{getStatusLabel(usuario.status)}
										</span>
									</td>

									<td className="border-t border-gray-200 px-4 py-3 whitespace-nowrap text-slate-600">
										{usuario.profile_image_url ? "Sí" : "No"}
									</td>

									<td className="border-t border-gray-200 px-4 py-3 whitespace-nowrap">
										{formatDateShort(usuario.created_at)}
									</td>

									<td className="border-t border-gray-200 px-4 py-3 whitespace-nowrap">
										{formatDateShort(usuario.last_login_at)}
									</td>

									<td className="border-t border-gray-200 px-4 py-3">
										<div className="flex flex-wrap items-center gap-2">
											<Link
												href={`/admin/users/usuarios/${usuario.id}`}
												className="rounded-md bg-sky-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-sky-700"
											>
												Ver
											</Link>

											<Link
												href={`/admin/users/usuarios/${usuario.id}/edit`}
												className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
											>
												Editar
											</Link>

											{usuario.status !== "inactive" && (
												<Link
													href={`/admin/users/usuarios/${usuario.id}/remove`}
													className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-200"
												>
													Desactivar
												</Link>
											)}
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

"use client";

import type { SortDirection, SortField } from "./users-table-utils";
import {
	getRoleLabel,
	getStatusLabel,
	sortableFields,
} from "./users-table-utils";

type Props = {
	search: string;
	setSearch: (value: string) => void;
	roleFilter: string;
	setRoleFilter: (value: string) => void;
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	hasImageFilter: string;
	setHasImageFilter: (value: string) => void;
	hideInactiveUsers: boolean;
	setHideInactiveUsers: (value: boolean) => void;
	sortField: SortField;
	setSortField: (value: SortField) => void;
	sortDirection: SortDirection;
	setSortDirection: (value: SortDirection) => void;
	roles: string[];
	statuses: string[];
	filteredAndSortedUsers: { id: string }[];
	totalUsuarios: number;
	resetFilters: () => void;
};

export function UsersTableFilters({
	search,
	setSearch,
	roleFilter,
	setRoleFilter,
	statusFilter,
	setStatusFilter,
	hasImageFilter,
	setHasImageFilter,
	hideInactiveUsers,
	setHideInactiveUsers,
	sortField,
	setSortField,
	sortDirection,
	setSortDirection,
	roles,
	statuses,
	filteredAndSortedUsers,
	totalUsuarios,
	resetFilters,
}: Props) {
	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div className="xl:col-span-1">
					<label className="mb-1 block text-sm font-semibold text-slate-700">
						Buscar
					</label>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Nombre, correo, empresa, teléfono..."
						className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-500"
					/>
				</div>

				<div>
					<label className="mb-1 block text-sm font-semibold text-slate-700">
						Rol
					</label>
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
					>
						<option value="todos">Todos</option>
						{roles.map((role) => (
							<option key={role} value={role}>
								{getRoleLabel(role as "admin" | "client" | "commercial")}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="mb-1 block text-sm font-semibold text-slate-700">
						Estado
					</label>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
					>
						<option value="todos">Todos</option>
						{statuses.map((status) => (
							<option key={status} value={status}>
								{getStatusLabel(status as "active" | "inactive" | "blocked")}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="mb-1 block text-sm font-semibold text-slate-700">
						Imagen
					</label>
					<select
						value={hasImageFilter}
						onChange={(e) => setHasImageFilter(e.target.value)}
						className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
					>
						<option value="todos">Todos</option>
						<option value="con_imagen">Con imagen</option>
						<option value="sin_imagen">Sin imagen</option>
					</select>
				</div>
			</div>

			<div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
					<label className="flex items-center gap-2 text-sm text-slate-700">
						<input
							type="checkbox"
							checked={hideInactiveUsers}
							onChange={(e) => setHideInactiveUsers(e.target.checked)}
							className="h-4 w-4 rounded border-gray-300"
						/>
						Ocultar usuarios inactivos
					</label>

					<div>
						<label className="mb-1 block text-sm font-semibold text-slate-700">
							Ordenar por
						</label>
						<select
							value={sortField}
							onChange={(e) => setSortField(e.target.value as SortField)}
							className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
						>
							{sortableFields
								.filter((field) => field.key !== "id")
								.map((field) => (
									<option key={field.key} value={field.key}>
										{field.label}
									</option>
								))}
						</select>
					</div>

					<div>
						<label className="mb-1 block text-sm font-semibold text-slate-700">
							Dirección
						</label>
						<select
							value={sortDirection}
							onChange={(e) =>
								setSortDirection(e.target.value as SortDirection)
							}
							className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
						>
							<option value="asc">Ascendente</option>
							<option value="desc">Descendente</option>
						</select>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<span className="text-sm text-slate-600">
						Mostrando <strong>{filteredAndSortedUsers.length}</strong> de{" "}
						<strong>{totalUsuarios}</strong> usuarios
					</span>

					<button
						type="button"
						onClick={resetFilters}
						className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
					>
						Limpiar filtros
					</button>
				</div>
			</div>
		</div>
	);
}

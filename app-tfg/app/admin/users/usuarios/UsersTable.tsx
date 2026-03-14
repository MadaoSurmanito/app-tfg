"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type Usuario = {
	id: string;
	name: string;
	email: string;
	company: string | null;
	phone: string | null;
	role: "admin" | "cliente" | "comercial";
	status: "activo" | "inactivo" | "bloqueado";
	image_url: string | null;
	created_at: string;
	last_login: string | null;
};

type Props = {
	usuarios: Usuario[];
};

type SortField = keyof Usuario;
type SortDirection = "asc" | "desc";

const sortableFields: { key: SortField; label: string }[] = [
	{ key: "id", label: "ID" },
	{ key: "name", label: "Nombre" },
	{ key: "email", label: "Correo" },
	{ key: "company", label: "Empresa" },
	{ key: "phone", label: "Teléfono" },
	{ key: "role", label: "Rol" },
	{ key: "status", label: "Estado" },
	{ key: "image_url", label: "Imagen" },
	{ key: "created_at", label: "Fecha de alta" },
	{ key: "last_login", label: "Último login" },
];

function formatDate(value: string | null) {
	if (!value) return "-";

	return new Date(value).toLocaleString("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function normalizeValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	return String(value).toLowerCase();
}

function compareValues(a: unknown, b: unknown) {
	if (a === null || a === undefined) return 1;
	if (b === null || b === undefined) return -1;

	const aDate =
		typeof a === "string" && !Number.isNaN(Date.parse(a))
			? Date.parse(a)
			: null;
	const bDate =
		typeof b === "string" && !Number.isNaN(Date.parse(b))
			? Date.parse(b)
			: null;

	if (aDate !== null && bDate !== null) {
		return aDate - bDate;
	}

	return String(a).localeCompare(String(b), "es", { sensitivity: "base" });
}

function getRoleClasses(role: Usuario["role"]) {
	switch (role) {
		case "admin":
			return "bg-red-500/20 text-red-200";
		case "cliente":
			return "bg-emerald-500/20 text-emerald-200";
		case "comercial":
			return "bg-blue-500/20 text-blue-200";
		default:
			return "bg-white/10 text-white";
	}
}

function getStatusClasses(status: Usuario["status"]) {
	switch (status) {
		case "activo":
			return "bg-green-500/20 text-green-200";
		case "inactivo":
			return "bg-yellow-500/20 text-yellow-200";
		case "bloqueado":
			return "bg-red-500/20 text-red-200";
		default:
			return "bg-white/10 text-white";
	}
}

export default function UsersTable({ usuarios }: Props) {
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("todos");
	const [statusFilter, setStatusFilter] = useState("todos");
	const [hasImageFilter, setHasImageFilter] = useState("todos");
	const [sortField, setSortField] = useState<SortField>("created_at");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const roles = useMemo(() => {
		return [...new Set(usuarios.map((u) => u.role).filter(Boolean))].sort(
			(a, b) => a.localeCompare(b, "es", { sensitivity: "base" }),
		);
	}, [usuarios]);

	const statuses = useMemo(() => {
		return [...new Set(usuarios.map((u) => u.status).filter(Boolean))].sort(
			(a, b) => a.localeCompare(b, "es", { sensitivity: "base" }),
		);
	}, [usuarios]);

	const filteredAndSortedUsers = useMemo(() => {
		const searchTerm = search.trim().toLowerCase();

		const filtered = usuarios.filter((usuario) => {
			const matchesSearch =
				searchTerm === "" ||
				Object.values(usuario).some((value) =>
					normalizeValue(value).includes(searchTerm),
				);

			const matchesRole = roleFilter === "todos" || usuario.role === roleFilter;

			const matchesStatus =
				statusFilter === "todos" || usuario.status === statusFilter;

			const matchesImage =
				hasImageFilter === "todos" ||
				(hasImageFilter === "con_imagen" && !!usuario.image_url) ||
				(hasImageFilter === "sin_imagen" && !usuario.image_url);

			return matchesSearch && matchesRole && matchesStatus && matchesImage;
		});

		const sorted = [...filtered].sort((a, b) => {
			const result = compareValues(a[sortField], b[sortField]);
			return sortDirection === "asc" ? result : -result;
		});

		return sorted;
	}, [
		usuarios,
		search,
		roleFilter,
		statusFilter,
		hasImageFilter,
		sortField,
		sortDirection,
	]);

	function handleSort(field: SortField) {
		if (sortField === field) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
			return;
		}

		setSortField(field);
		setSortDirection("asc");
	}

	function resetFilters() {
		setSearch("");
		setRoleFilter("todos");
		setStatusFilter("todos");
		setHasImageFilter("todos");
		setSortField("created_at");
		setSortDirection("desc");
	}

	return (
		<div className="space-y-4">
			<div className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-lg backdrop-blur">
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
					<div className="xl:col-span-2">
						<label className="mb-1 block text-sm font-medium text-white">
							Buscar en todos los campos
						</label>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Nombre, correo, empresa, teléfono, rol..."
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white placeholder:text-white/50 outline-none transition focus:border-cyan-400"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-white">
							Rol
						</label>
						<select
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						>
							<option value="todos">Todos</option>
							{roles.map((role) => (
								<option key={role} value={role}>
									{role}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-white">
							Estado
						</label>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						>
							<option value="todos">Todos</option>
							{statuses.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-white">
							Imagen
						</label>
						<select
							value={hasImageFilter}
							onChange={(e) => setHasImageFilter(e.target.value)}
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						>
							<option value="todos">Todos</option>
							<option value="con_imagen">Con imagen</option>
							<option value="sin_imagen">Sin imagen</option>
						</select>
					</div>
				</div>

				<div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<div>
							<label className="mb-1 block text-sm font-medium text-white">
								Ordenar por
							</label>
							<select
								value={sortField}
								onChange={(e) => setSortField(e.target.value as SortField)}
								className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
							>
								{sortableFields.map((field) => (
									<option key={field.key} value={field.key}>
										{field.label}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="mb-1 block text-sm font-medium text-white">
								Dirección
							</label>
							<select
								value={sortDirection}
								onChange={(e) =>
									setSortDirection(e.target.value as SortDirection)
								}
								className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
							>
								<option value="asc">Ascendente</option>
								<option value="desc">Descendente</option>
							</select>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<span className="text-sm text-white/80">
							Mostrando <strong>{filteredAndSortedUsers.length}</strong> de{" "}
							<strong>{usuarios.length}</strong> usuarios
						</span>

						<button
							type="button"
							onClick={resetFilters}
							className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
						>
							Limpiar filtros
						</button>
					</div>
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-lg backdrop-blur">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm text-white">
						<thead className="bg-black/20">
							<tr>
								{sortableFields.map((field) => (
									<th
										key={field.key}
										className="whitespace-nowrap px-4 py-3 text-left font-semibold"
									>
										<button
											type="button"
											onClick={() => handleSort(field.key)}
											className="flex items-center gap-2 transition hover:text-cyan-300"
										>
											<span>{field.label}</span>
											{sortField === field.key && (
												<span>{sortDirection === "asc" ? "↑" : "↓"}</span>
											)}
										</button>
									</th>
								))}
								<th className="px-4 py-3 text-left font-semibold">Acciones</th>
							</tr>
						</thead>

						<tbody>
							{filteredAndSortedUsers.length === 0 ? (
								<tr>
									<td
										colSpan={sortableFields.length + 1}
										className="px-4 py-8 text-center text-white/70"
									>
										No hay usuarios que coincidan con los filtros.
									</td>
								</tr>
							) : (
								filteredAndSortedUsers.map((usuario) => (
									<tr
										key={usuario.id}
										className="border-t border-white/10 transition hover:bg-white/5"
									>
										<td className="px-4 py-3 font-mono text-xs text-white/80">
											{usuario.id}
										</td>
										<td className="px-4 py-3">{usuario.name}</td>
										<td className="px-4 py-3">{usuario.email}</td>
										<td className="px-4 py-3">{usuario.company || "-"}</td>
										<td className="px-4 py-3">{usuario.phone || "-"}</td>
										<td className="px-4 py-3">
											<span
												className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleClasses(usuario.role)}`}
											>
												{usuario.role}
											</span>
										</td>
										<td className="px-4 py-3">
											<span
												className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(usuario.status)}`}
											>
												{usuario.status}
											</span>
										</td>
										<td className="px-4 py-3">
											{usuario.image_url ? "Sí" : "No"}
										</td>
										<td className="px-4 py-3">
											{formatDate(usuario.created_at)}
										</td>
										<td className="px-4 py-3">
											{formatDate(usuario.last_login)}
										</td>
										<td className="px-4 py-3">
											<div className="flex gap-2">
												<Link
													href={`/admin/usuarios/${usuario.id}`}
													className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-700"
												>
													Ver
												</Link>

												<Link
													href={`/admin/usuarios/${usuario.id}/edit`}
													className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
												>
													Editar
												</Link>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
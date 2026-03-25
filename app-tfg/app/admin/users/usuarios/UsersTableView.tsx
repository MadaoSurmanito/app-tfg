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
import { AnimatePresence, motion } from "framer-motion";

type Props = {
	filteredAndSortedUsers: Usuario[];
	sortField: SortField;
	sortDirection: SortDirection;
	handleSort: (field: SortField) => void;
};

function UserCard({ usuario }: { usuario: Usuario }) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 12, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 0.98 }}
			exit={{ opacity: 0, y: -12, scale: 0.98 }}
			transition={{ duration: 0.28, ease: "easeInOut" }}
			className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:shadow-md"
		>
			{/* HEADER: imagen + nombre + email */}
			<div className="flex items-start gap-3">
				<div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
					{usuario.profile_image_url ? (
						<img
							src={usuario.profile_image_url}
							alt={usuario.name}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
							IMG
						</div>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-semibold text-slate-800">
						{usuario.name}
					</p>
					<p className="truncate text-xs text-slate-600">{usuario.email}</p>
				</div>

				<div className="ml-auto flex flex-col items-end gap-2">
					<span
						className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleClassesLight(usuario.role)}`}
					>
						{getRoleLabel(usuario.role)}
					</span>

					<span
						className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassesLight(usuario.status)}`}
					>
						{getStatusLabel(usuario.status)}
					</span>
				</div>
			</div>

			{/* INFO */}
			<div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
				<div>
					<span className="font-medium text-slate-700">Empresa:</span>{" "}
					{usuario.company || "-"}
				</div>
				<div>
					<span className="font-medium text-slate-700">Teléfono:</span>{" "}
					{usuario.phone || "-"}
				</div>
				<div>
					<span className="font-medium text-slate-700">Alta:</span>{" "}
					{formatDateShort(usuario.created_at)}
				</div>
				<div>
					<span className="font-medium text-slate-700">Login:</span>{" "}
					{formatDateShort(usuario.last_login_at)}
				</div>
			</div>

			{/* ACTIONS */}
			<div className="mt-3 flex flex-wrap gap-2">
				<Link
					href={`/admin/users/usuarios/${usuario.id}`}
					className="rounded-md bg-sky-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-sky-700"
				>
					Ver
				</Link>

				<Link
					href={`/admin/users/usuarios/${usuario.id}/edit`}
					className="rounded-md bg-slate-100 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-200"
				>
					Editar
				</Link>

				{usuario.status !== "inactive" && (
					<Link
						href={`/admin/users/usuarios/${usuario.id}/remove`}
						className="rounded-md bg-amber-100 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 transition hover:bg-amber-200"
					>
						Desactivar
					</Link>
				)}
			</div>
		</motion.div>
	);
}

export function UsersTableView({ filteredAndSortedUsers }: Props) {
	return (
		<div className="rounded-2xl border border-gray-200 bg-white shadow-md">
			{filteredAndSortedUsers.length === 0 ? (
				<div className="px-4 py-10 text-center text-slate-500">
					No hay usuarios que coincidan con los filtros.
				</div>
			) : (
				<motion.div
					layout
					className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3"
				>
					<AnimatePresence mode="popLayout">
						{filteredAndSortedUsers.map((usuario) => (
							<UserCard key={usuario.id} usuario={usuario} />
						))}
					</AnimatePresence>
				</motion.div>
			)}
		</div>
	);
}

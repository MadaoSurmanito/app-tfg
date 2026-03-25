import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import H1Title from "@/app/components/H1Title";
import PageTransition from "@/app/components/PageTransition";
import { getUserById } from "@/lib/typeorm/services/users/get-user-by-id";
import {
	formatDate,
	getRoleClassesLight,
	getRoleLabel,
	getStatusClassesLight,
	getStatusLabel,
} from "../users-table-utils";

type Props = {
	params: Promise<{ id: string }>;
};

// Página de detalle de usuario.
// Al ser un Server Component, consulta directamente el servicio.
export default async function UsuarioDetallePage({ params }: Props) {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	if (session.user?.role !== "admin") {
		redirect("/");
	}

	const { id } = await params;
	const user = await getUserById(id);

	if (!user) {
		notFound();
	}

	return (
		<PageTransition>
			<H1Title title={user.name} subtitle="Detalle del usuario seleccionado" />

			<div className="mx-auto mt-6 w-full max-w-4xl">
				<div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
					<div className="flex flex-col gap-6 md:flex-row md:items-start">
						<div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
							{user.profile_image_url ? (
								<img
									src={user.profile_image_url}
									alt={user.name}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
									Sin imagen
								</div>
							)}
						</div>

						<div className="min-w-0 flex-1">
							<h2 className="text-xl font-semibold text-slate-800">
								{user.name}
							</h2>
							<p className="mt-1 text-sm text-slate-600">{user.email}</p>

							<div className="mt-3 flex flex-wrap gap-2">
								<span
									className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleClassesLight(
										user.role.code as "admin" | "client" | "commercial",
									)}`}
								>
									{getRoleLabel(
										user.role.code as "admin" | "client" | "commercial",
									)}
								</span>

								<span
									className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassesLight(
										user.status.code as "active" | "inactive" | "blocked",
									)}`}
								>
									{getStatusLabel(
										user.status.code as "active" | "inactive" | "blocked",
									)}
								</span>
							</div>
						</div>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="rounded-xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Empresa
							</p>
							<p className="mt-1 text-sm text-slate-800">
								{user.company || "-"}
							</p>
						</div>

						<div className="rounded-xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Teléfono
							</p>
							<p className="mt-1 text-sm text-slate-800">{user.phone || "-"}</p>
						</div>

						<div className="rounded-xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Fecha de alta
							</p>
							<p className="mt-1 text-sm text-slate-800">
								{formatDate(user.created_at.toISOString())}
							</p>
						</div>

						<div className="rounded-xl bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
								Último login
							</p>
							<p className="mt-1 text-sm text-slate-800">
								{user.last_login_at
									? formatDate(user.last_login_at.toISOString())
									: "-"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</PageTransition>
	);
}

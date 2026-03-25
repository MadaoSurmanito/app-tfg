import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserById } from "@/app/lib/typeorm/services/users/get-user-by-id";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function RemoveUserPage({ params }: Props) {
	const session = await auth();

	if (!session || session.user.role !== "admin") {
		redirect("/");
	}

	const { id } = await params;
	const user = await getUserById(id);

	if (!user) {
		notFound();
	}

	const isSelf = session.user.id === user.id;
	const isAlreadyInactive = user.status.code === "inactive";

	return (
		<div className="space-y-6">
			<div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur">
				<h1 className="text-2xl font-semibold text-white">
					Desactivar usuario
				</h1>
				<p className="mt-2 text-sm text-white/80">
					Esta acción no elimina el usuario. Solo cambia su estado a{" "}
					<strong>inactivo</strong> para impedir su acceso al sistema.
				</p>
			</div>

			<div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6 shadow-lg backdrop-blur">
				<div className="space-y-2 text-white">
					<p>
						¿Seguro que quieres desactivar a <strong>{user.name}</strong>{" "}
						({user.email})?
					</p>

					<p className="text-sm text-white/70">
						Rol actual: <strong>{user.role.name}</strong>
					</p>

					<p className="text-sm text-white/70">
						Estado actual: <strong>{user.status.name}</strong>
					</p>
				</div>

				{isSelf ? (
					<div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
						No puedes desactivar tu propio usuario mientras tienes la sesión
						iniciada.
					</div>
				) : isAlreadyInactive ? (
					<div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-white/80">
						Este usuario ya se encuentra inactivo.
					</div>
				) : (
					<form
						action={`/api/admin/users/${id}/remove`}
						method="POST"
						className="mt-6 flex flex-wrap gap-3"
					>
						<button
							type="submit"
							className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-yellow-400"
						>
							Desactivar usuario
						</button>

						<Link
							href={`/admin/users/usuarios/${id}`}
							className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
						>
							Cancelar
						</Link>
					</form>
				)}

				{(isSelf || isAlreadyInactive) && (
					<div className="mt-6">
						<Link
							href={`/admin/users/usuarios/${id}`}
							className="inline-flex rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
						>
							Volver al usuario
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
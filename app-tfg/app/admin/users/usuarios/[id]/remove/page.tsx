import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";

type Props = {
	params: Promise<{ id: string }>;
};

export default async function RemoveUserPage({ params }: Props) {
	const session = await auth();

	if (!session || session.user.role !== "admin") {
		redirect("/");
	}

	const { id } = await params;

	const result = await pool.query(
		`
			SELECT
				u.id,
				u.name,
				u.email,
				r.code AS role_code,
				r.name AS role_name,
				s.id AS status_id,
				s.code AS status_code,
				s.name AS status_name
			FROM users u
			INNER JOIN roles r
				ON r.id = u.role_id
			INNER JOIN user_statuses s
				ON s.id = u.status_id
			WHERE u.id = $1
		`,
		[id],
	);

	if (result.rowCount === 0) {
		notFound();
	}

	const user = result.rows[0] as {
		id: string;
		name: string;
		email: string;
		role_code: string;
		role_name: string;
		status_id: number;
		status_code: string;
		status_name: string;
	};

	const isSelf = session.user.id === user.id;
	const isAlreadyInactive = user.status_code === "inactive";

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
						Rol actual: <strong>{user.role_name}</strong>
					</p>

					<p className="text-sm text-white/70">
						Estado actual: <strong>{user.status_name}</strong>
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
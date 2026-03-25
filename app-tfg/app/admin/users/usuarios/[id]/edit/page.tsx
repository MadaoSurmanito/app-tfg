import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import PasswordFieldWithStrength from "@/app/components/PasswordFieldWithStrength";
import { getUserById } from "@/lib/typeorm/services/users/get-user-by-id";
import { listRoles } from "@/lib/typeorm/services/users/list-roles";
import { listUserStatuses } from "@/lib/typeorm/services/users/list-users-statuses";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export default async function EditUsuarioPage({ params }: Props) {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	const { id } = await params;

	const [usuario, roles, statuses] = await Promise.all([
		getUserById(id),
		listRoles(),
		listUserStatuses(),
	]);

	if (!usuario) {
		notFound();
	}

	return (
		<div className="mx-auto mt-6 w-full max-w-3xl">
			<form
				action={`/api/admin/users/usuarios/${usuario.id}`}
				method="POST"
				className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur"
			>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="md:col-span-2">
						<label className="mb-1 block text-sm font-medium text-white">
							Nombre
						</label>
						<input
							name="name"
							type="text"
							defaultValue={usuario.name}
							required
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						/>
					</div>

					<div className="md:col-span-2">
						<label className="mb-1 block text-sm font-medium text-white">
							Correo
						</label>
						<input
							name="email"
							type="email"
							defaultValue={usuario.email}
							required
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-white">
							Empresa
						</label>
						<input
							name="company"
							type="text"
							defaultValue={usuario.company ?? ""}
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-white">
							Teléfono
						</label>
						<input
							name="phone"
							type="text"
							defaultValue={usuario.phone ?? ""}
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-white">
							Rol
						</label>
						<select
							name="role_id"
							defaultValue={String(usuario.role_id)}
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						>
							{roles.map((role) => (
								<option key={role.id} value={role.id}>
									{role.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-white">
							Estado
						</label>
						<select
							name="status_id"
							defaultValue={String(usuario.status_id)}
							className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 text-white outline-none transition focus:border-cyan-400"
						>
							{statuses.map((status) => (
								<option key={status.id} value={status.id}>
									{status.name}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="mt-6 border-t border-white/10 pt-6">
					<label className="mb-1 block text-sm font-medium text-white">
						Contraseña
					</label>
					<PasswordFieldWithStrength
						name="password"
						label="Nueva contraseña"
						placeholder="Dejar en blanco para no cambiarla"
						required={false}
						showConfirm
						confirmName="confirm_password"
						confirmLabel="Confirmar nueva contraseña"
					/>
				</div>

				<div className="mt-6 flex gap-3">
					<button
						type="submit"
						className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
					>
						Guardar cambios
					</button>

					<Link
						href={`/admin/users/usuarios/${usuario.id}`}
						className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
					>
						Cancelar
					</Link>
				</div>
			</form>
		</div>
	);
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/require-session";
import { getUserById } from "@/lib/typeorm/services/users/user";
import PageTransition from "@/app/components/animations/PageTransition";

// Recibe el ID del usuario a desactivar a través de los parámetros de la URL.
type Props = {
	params: Promise<{ id: string }>;
};

// admin/users/usuarios/[id]/remove
// Página de confirmación para la desactivación de un usuario.
// No realiza la acción directamente, sino que muestra un resumen del usuario
// y solicita confirmación antes de ejecutar el endpoint correspondiente.
export default async function RemoveUserPage({ params }: Props) {
	// CONTROL DE ACCESO
	// Se asegura de que el usuario esté autenticado y tenga rol de administrador.
	const session = await requireAdminSession();

	// PARÁMETROS Y CARGA DE DATOS
	// Obtiene el ID del usuario desde la URL.
	const { id } = await params;

	// Recupera el usuario desde base de datos.
	const user = await getUserById(id);

	// Si el usuario no existe, se muestra la página de "No encontrado".
	if (!user) {
		notFound();
	}

	// FLAGS DE ESTADO
	// Determina si el usuario autenticado está intentando desactivarse a sí mismo.
	const isSelf = session.user.id === user.id;

	// Determina si el usuario ya está inactivo.
	const isAlreadyInactive = user.status.code === "inactive";

	// RENDER
	return (
		<PageTransition>
			<div className="space-y-6">
				{/* CABECERA                                                             */}
				<div className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg backdrop-blur">
					<h1 className="text-2xl font-semibold text-white">
						Desactivar usuario
					</h1>
					<p className="mt-2 text-sm text-white/80">
						Esta acción no elimina el usuario. Solo cambia su estado a{" "}
						<strong>inactivo</strong> para impedir su acceso al sistema.
					</p>
				</div>

				{/* BLOQUE DE CONFIRMACIÓN                                               */}
				<div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6 shadow-lg backdrop-blur">
					{/* INFORMACIÓN DEL USUARIO                                          */}
					<div className="space-y-2 text-white">
						<p>
							¿Seguro que quieres desactivar a <strong>{user.name}</strong> (
							{user.email})?
						</p>

						<p className="text-sm text-white/70">
							Rol actual: <strong>{user.role.name}</strong>
						</p>

						<p className="text-sm text-white/70">
							Estado actual: <strong>{user.status.name}</strong>
						</p>
					</div>

					{/* CASO 1: INTENTO DE AUTO-DESACTIVACIÓN                            */}
					{isSelf ? (
						<div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
							No puedes desactivar tu propio usuario mientras tienes la sesión
							iniciada.
						</div>
					) : null}

					{/* CASO 2: USUARIO YA INACTIVO                                      */}
					{!isSelf && isAlreadyInactive ? (
						<div className="mt-6 rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-white/80">
							Este usuario ya se encuentra inactivo.
						</div>
					) : null}

					{/* CASO 3: ACCIÓN DISPONIBLE                                        */}
					{!isSelf && !isAlreadyInactive ? (
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
					) : null}

					{/* ACCIÓN ALTERNATIVA CUANDO NO SE PUEDE EJECUTAR                   */}
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
		</PageTransition>
	);
}

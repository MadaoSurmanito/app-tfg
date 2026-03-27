import { notFound } from "next/navigation";
import UserProfileCard from "@/app/components/users/UserProfileCard";
import { getUserById } from "@/lib/typeorm/services/users/user";
import { listRoles } from "@/lib/typeorm/services/users/role";
import { listUserStatuses } from "@/lib/typeorm/services/users/status";
import PageTransition from "@/app/components/animations/PageTransition";

// Recibe el ID del usuario a editar a través de los parámetros de la URL.
type Props = {
	params: Promise<{ id: string }>;
};

// admin/users/list/[id]/edit
// Página para editar un usuario específico desde el panel de administración.
// Se accede desde la tabla de usuarios y permite modificar sus datos,
// así como su rol, estado y contraseña.
export default async function EditUsuarioPage({ params }: Props) {
	// PARÁMETROS Y CARGA DE DATOS
	// Obtiene el ID del usuario a editar desde la URL.
	const { id } = await params;

	// Carga en paralelo:
	// - el usuario seleccionado
	// - los roles disponibles para el selector
	// - los estados disponibles para el selector
	const [usuario, roles, statuses] = await Promise.all([
		getUserById(id),
		listRoles(),
		listUserStatuses(),
	]);

	// Si el usuario no existe, se muestra la página de "No encontrado".
	if (!usuario) {
		notFound();
	}

	// RENDER
	return (
		<PageTransition>
			{/* TARJETA DE PERFIL EN MODO EDICIÓN */}
			<UserProfileCard
				mode="admin-edit"
				title="Editar usuario"
				subtitle="Modifica la información, el rol, el estado y la contraseña del usuario."
				backHref={`/admin/users/list/${usuario.id}`}
				submitLabel="Guardar cambios"
				submitUrl={`/api/admin/users/${usuario.id}`}
				roles={roles.map((role) => ({
					id: role.id,
					name: role.name,
				}))}
				statuses={statuses.map((status) => ({
					id: status.id,
					name: status.name,
				}))}
				user={{
					id: usuario.id,
					name: usuario.name,
					email: usuario.email,
					company: usuario.company,
					phone: usuario.phone,
					profile_image_url: usuario.profile_image_url,
					created_at: usuario.created_at,
					last_login_at: usuario.last_login_at,
					role_id: usuario.role_id,
					status_id: usuario.status_id,
					role: {
						code: usuario.role.code as "admin" | "client" | "commercial",
					},
					status: {
						code: usuario.status.code as "active" | "inactive" | "blocked",
					},
				}}
			/>
		</PageTransition>
	);
}

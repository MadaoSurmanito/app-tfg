import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import UserProfileCard from "@/app/components/users/UserProfileCard";
import { getUserById } from "@/lib/typeorm/services/users/get-user-by-id";
import { listRoles } from "@/lib/typeorm/services/users/list-roles";
import { listUserStatuses } from "@/lib/typeorm/services/users/list-users-statuses";
import PageTransition from "@/app/components/animations/PageTransition";
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
		<PageTransition>
			<UserProfileCard
				mode="admin-edit"
				title="Editar usuario"
				subtitle="Modifica la información, el rol, el estado y la contraseña del usuario."
				backHref={`/admin/users/usuarios/${usuario.id}`}
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

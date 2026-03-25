import { redirect } from "next/navigation";
import { auth } from "@/auth";
import H1Title from "@/app/components/H1Title";
import PageTransition from "@/app/components/PageTransition";
import UsersTable from "./UsersTable";
import { listUsers } from "@/lib/typeorm/services/users/list-users";
import { mapUserToUsuario } from "./user-table-mapper";

// Lista de usuarios del sistema.
// Al ser un Server Component, podemos consultar directamente la capa de servicios
// sin pasar por fetch a la API interna.
export default async function UsuariosPage() {
	const session = await auth();

	if (!session) {
		redirect("/login");
	}

	if (session.user?.role !== "admin") {
		redirect("/");
	}

	// Cargamos entidades TypeORM con sus relaciones y las adaptamos
	// a un DTO plano de UI antes de pasarlas al componente cliente.
	const usuarios = (await listUsers()).map(mapUserToUsuario);

	return (
		<PageTransition>
			<H1Title title="Usuarios" subtitle="Lista de usuarios del sistema" />

			<div className="mx-auto mt-6 w-full max-w-7xl">
				<UsersTable usuarios={usuarios} />
			</div>
		</PageTransition>
	);
}
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import HeaderTitle from "@/app/components/HeaderTitle";
import UsersTable, { type Usuario } from "./UsersTable";

// En esta página se muestra la lista de usuarios del sistema.
// Solo accesible para el admin. Desde aquí se pueden consultar,
// filtrar y ordenar todos los usuarios registrados.
export default async function UsuariosPage() {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	const result = await pool.query<Usuario>(`
		SELECT
			id,
			name,
			email,
			company,
			phone,
			role,
			status,
			image_url,
			created_at,
			last_login
		FROM users
		ORDER BY created_at DESC
	`);

	const usuarios = result.rows;

	return (
		<>
			<HeaderTitle title="Usuarios" />

			<div className="mx-auto mt-6 w-full max-w-7xl">
				<UsersTable usuarios={usuarios} />
			</div>
		</>
	);
}
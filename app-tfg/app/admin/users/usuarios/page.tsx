import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import HeaderTitle from "@/app/components/HeaderTitle";
import UsersTable, { type Usuario } from "./UsersTable";

// Lista de usuarios del sistema
export default async function UsuariosPage() {
	const session = await auth();

	if (!session?.user || session.user.role !== "admin") {
		redirect("/login");
	}

	// Cargar usuarios con rol y estado
	const result = await pool.query<Usuario>(
		`
		SELECT
			u.id,
			u.name,
			u.email,
			u.company,
			u.phone,
			r.code AS role,
			us.code AS status,
			u.profile_image_url,
			u.created_at,
			u.last_login_at
		FROM users u
		INNER JOIN roles r
			ON r.id = u.role_id
		INNER JOIN user_statuses us
			ON us.id = u.status_id
		ORDER BY u.created_at DESC
	`,
	);

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

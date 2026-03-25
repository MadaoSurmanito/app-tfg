// Adaptador entre la entidad TypeORM y el DTO plano de la tabla.
// Esto evita acoplar la UI directamente al modelo de persistencia.

import { type User } from "@/app/lib/typeorm/entities/User";
import { type Usuario } from "./users-table-utils";

export function mapUserToUsuario(user: User): Usuario {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		company: user.company,
		phone: user.phone,
		role: user.role.code as Usuario["role"],
		status: user.status.code as Usuario["status"],
		profile_image_url: user.profile_image_url,
		created_at: user.created_at.toISOString(),
		last_login_at: user.last_login_at
			? user.last_login_at.toISOString()
			: null,
	};
}
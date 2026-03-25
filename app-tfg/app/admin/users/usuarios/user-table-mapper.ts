// Adaptador entre la entidad TypeORM y el DTO plano de la tabla.
// Esto evita acoplar la UI directamente al modelo de persistencia.

import { type ObjectLiteral } from "typeorm";
import { type User } from "@/lib/typeorm/entities/User";
import { type Usuario } from "./users-table-utils";

export function mapUserToUsuario(user: ObjectLiteral): Usuario {
	const typedUser = user as User;

	return {
		id: typedUser.id,
		name: typedUser.name,
		email: typedUser.email,
		company: typedUser.company,
		phone: typedUser.phone,
		role: typedUser.role.code as Usuario["role"],
		status: typedUser.status.code as Usuario["status"],
		profile_image_url: typedUser.profile_image_url,
		created_at: typedUser.created_at.toISOString(),
		last_login_at: typedUser.last_login_at
			? typedUser.last_login_at.toISOString()
			: null,
	};
}
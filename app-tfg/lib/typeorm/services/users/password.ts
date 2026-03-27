import bcrypt from "bcryptjs";
import { getDataSource } from "@/lib/typeorm/data-source";
import { USER_ADMIN_ACTION_TYPE_IDS } from "@/lib/typeorm/constants/catalog-ids";
import { User } from "@/lib/typeorm/entities/User";
import { UserManagementLog } from "@/lib/typeorm/entities/UserManagementLog";
import { UserAccessLog } from "@/lib/typeorm/entities/UserAccessLog";

// Servicio para cambiar la contraseña de un usuario, ya sea por el propio usuario (requiriendo la contraseña actual) o por un administrador (con opción de revocar sesiones activas). Registra la acción en el log de administración de usuarios y, si es un cambio por parte del usuario, revoca las demás sesiones activas para mayor seguridad.
type ChangeOwnPasswordInput = {
	mode: "self";
	userId: string;
	currentPassword: string;
	newPassword: string;
	currentAccessSessionId?: string | null;
};

type ChangePasswordByAdminInput = {
	mode: "admin";
	userId: string;
	newPassword: string;
	performedByUserId: string;
	reason?: string | null;
	notes?: string | null;
	revokeSessions?: boolean;
};

export type ChangeUserPasswordInput =
	| ChangeOwnPasswordInput
	| ChangePasswordByAdminInput;

export type ChangeUserPasswordResult =
	| { ok: true }
	| {
			ok: false;
			error: "usuario" | "actual" | "server";
	  };

export async function changeUserPassword(
	input: ChangeUserPasswordInput,
): Promise<ChangeUserPasswordResult> {
	const ds = await getDataSource();

	try {
		return await ds.transaction(async (manager) => {
			const userRepo = manager.getRepository(User);
			const logRepo = manager.getRepository(UserManagementLog);
			const accessLogRepo = manager.getRepository(UserAccessLog);

			const user = await userRepo.findOne({
				where: { id: input.userId },
			});

			if (!user) {
				return { ok: false, error: "usuario" };
			}

			if (input.mode === "self") {
				const validCurrentPassword = await bcrypt.compare(
					input.currentPassword,
					user.password_hash,
				);

				if (!validCurrentPassword) {
					return { ok: false, error: "actual" };
				}
			}

			const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

			user.password_hash = newPasswordHash;
			user.updated_at = new Date();

			await userRepo.save(user);

			await logRepo.save(
				logRepo.create({
					target_user_id: user.id,
					performed_by:
						input.mode === "self" ? input.userId : input.performedByUserId,
					action_type_id: USER_ADMIN_ACTION_TYPE_IDS.PASSWORD_RESET,
					previous_status_id: null,
					new_status_id: null,
					previous_role_id: null,
					new_role_id: null,
					reason: input.mode === "admin" ? (input.reason ?? null) : null,
					notes:
						input.mode === "self"
							? "Cambio de contraseña realizado por el propio usuario"
							: (input.notes ??
								"Cambio de contraseña realizado por administrador"),
				}),
			);

			if (input.mode === "self" && input.currentAccessSessionId) {
				await accessLogRepo
					.createQueryBuilder()
					.update()
					.set({
						revoked_at: () => "NOW()",
					})
					.where("user_id = :userId", { userId: input.userId })
					.andWhere("session_token IS NOT NULL")
					.andWhere("session_token <> :sessionToken", {
						sessionToken: input.currentAccessSessionId,
					})
					.andWhere("revoked_at IS NULL")
					.execute();
			}

			if (input.mode === "admin" && input.revokeSessions) {
				await accessLogRepo
					.createQueryBuilder()
					.update()
					.set({
						revoked_at: () => "NOW()",
					})
					.where("user_id = :userId", { userId: input.userId })
					.andWhere("session_token IS NOT NULL")
					.andWhere("revoked_at IS NULL")
					.execute();
			}

			return { ok: true };
		});
	} catch (error) {
		console.error("Error en changeUserPassword:", error);
		return { ok: false, error: "server" };
	}
}

import bcrypt from "bcryptjs";
import { getDataSource } from "../../data-source";
import { USER_ADMIN_ACTION_TYPE_IDS } from "../../constants/catalog-ids";

type ChangePasswordInput = {
	userId: string;
	currentPassword: string;
	newPassword: string;
	currentAccessSessionId?: string | null;
};

type ChangePasswordResult =
	| { ok: true }
	| {
			ok: false;
			error: "usuario" | "actual" | "server";
	  };

// Cambia la contraseña del usuario autenticado, registra el cambio en
// user_management_log y revoca otras sesiones activas.
export async function changePassword(
	input: ChangePasswordInput,
): Promise<ChangePasswordResult> {
	const ds = await getDataSource();

	try {
		return await ds.transaction(async (manager) => {
			const userRepo = manager.getRepository("User");
			const logRepo = manager.getRepository("UserManagementLog");
			const accessLogRepo = manager.getRepository("UserAccessLog");

			const user = await userRepo.findOne({
				where: { id: input.userId },
			});

			if (!user) {
				return { ok: false, error: "usuario" };
			}

			const validCurrentPassword = await bcrypt.compare(
				input.currentPassword,
				user.password_hash,
			);

			if (!validCurrentPassword) {
				return { ok: false, error: "actual" };
			}

			const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

			user.password_hash = newPasswordHash;
			user.updated_at = new Date();

			await userRepo.save(user);

			await logRepo.save(
				logRepo.create({
					target_user_id: input.userId,
					performed_by: input.userId,
					action_type_id: USER_ADMIN_ACTION_TYPE_IDS.PASSWORD_RESET,
					previous_status_id: null,
					new_status_id: null,
					previous_role_id: null,
					new_role_id: null,
					reason: null,
					notes: "Cambio de contraseña realizado por el propio usuario",
				}),
			);

			if (input.currentAccessSessionId) {
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

			return { ok: true };
		});
	} catch (error) {
		console.error("Error en changePassword:", error);
		return { ok: false, error: "server" };
	}
}

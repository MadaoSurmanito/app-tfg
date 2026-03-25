import bcrypt from "bcryptjs";
import { getDataSource } from "@/app/lib/typeorm/data-source";
import { User } from "@/app/lib/typeorm/entities/User";
import { UserManagementLog } from "@/app/lib/typeorm/entities/UserManagementLog";
import { USER_ADMIN_ACTION_TYPE_IDS } from "@/app/lib/typeorm/constants/catalog-ids";

type ChangeUserPasswordInput = {
	userId: string;
	newPassword: string;
	performedByUserId: string;
	reason?: string | null;
	notes?: string | null;
};

export async function changeUserPassword(input: ChangeUserPasswordInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRepo = manager.getRepository(User);
		const logRepo = manager.getRepository(UserManagementLog);

		const user = await userRepo.findOne({
			where: { id: input.userId },
		});

		if (!user) {
			throw new Error("Usuario no encontrado");
		}

		user.password_hash = await bcrypt.hash(input.newPassword, 10);
		await userRepo.save(user);

		const log = logRepo.create({
			target_user_id: user.id,
			performed_by: input.performedByUserId,
			action_type_id: USER_ADMIN_ACTION_TYPE_IDS.PASSWORD_RESET,
			previous_status_id: null,
			new_status_id: null,
			previous_role_id: null,
			new_role_id: null,
			reason: input.reason ?? null,
			notes: input.notes ?? "Cambio de contraseña realizado por administrador",
		});

		await logRepo.save(log);

		return { success: true };
	});
}
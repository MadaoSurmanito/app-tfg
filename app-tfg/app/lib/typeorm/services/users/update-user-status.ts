import { getDataSource } from "@/app/lib/typeorm/data-source";
import { User } from "@/app/lib/typeorm/entities/User";
import { UserManagementLog } from "@/app/lib/typeorm/entities/UserManagementLog";
import { USER_ADMIN_ACTION_TYPE_IDS } from "@/app/lib/typeorm/constants/catalog-ids";

type UpdateUserStatusInput = {
	userId: string;
	newStatusId: number;
	performedByUserId: string;
	reason?: string | null;
	notes?: string | null;
};

export async function updateUserStatus(input: UpdateUserStatusInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRepo = manager.getRepository(User);
		const logRepo = manager.getRepository(UserManagementLog);

		const user = await userRepo.findOne({
			where: { id: input.userId },
			relations: {
				role: true,
				status: true,
			},
		});

		if (!user) {
			throw new Error("Usuario no encontrado");
		}

		if (user.status_id === input.newStatusId) {
			return user;
		}

		const previousStatusId = user.status_id;

		user.status_id = input.newStatusId;
		await userRepo.save(user);

		const log = logRepo.create({
			target_user_id: user.id,
			performed_by: input.performedByUserId,
			action_type_id: USER_ADMIN_ACTION_TYPE_IDS.STATUS_CHANGE,
			previous_status_id: previousStatusId,
			new_status_id: input.newStatusId,
			previous_role_id: null,
			new_role_id: null,
			reason: input.reason ?? null,
			notes: input.notes ?? "Cambio de estado realizado por administrador",
		});

		await logRepo.save(log);

		return userRepo.findOne({
			where: { id: user.id },
			relations: {
				role: true,
				status: true,
			},
		});
	});
}
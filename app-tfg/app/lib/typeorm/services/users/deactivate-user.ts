import { getDataSource } from "@/app/lib/typeorm/data-source";
import { User } from "@/app/lib/typeorm/entities/User";
import { UserStatus } from "@/app/lib/typeorm/entities/UserStatus";
import { UserManagementLog } from "@/app/lib/typeorm/entities/UserManagementLog";
import { UserAdminActionType } from "@/app/lib/typeorm/entities/UserAdminActionType";

type DeactivateUserInput = {
	userId: string;
	performedByUserId: string;
	performedByEmail?: string | null;
};

export class DeactivateUserError extends Error {
	code:
		| "USER_NOT_FOUND"
		| "SELF_DEACTIVATION_NOT_ALLOWED"
		| "INACTIVE_STATUS_NOT_FOUND"
		| "DEACTIVATE_ACTION_NOT_FOUND";

	constructor(code: DeactivateUserError["code"], message: string) {
		super(message);
		this.name = "DeactivateUserError";
		this.code = code;
	}
}

export async function deactivateUser(input: DeactivateUserInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRepo = manager.getRepository(User);
		const statusRepo = manager.getRepository(UserStatus);
		const logRepo = manager.getRepository(UserManagementLog);
		const actionTypeRepo = manager.getRepository(UserAdminActionType);

		const user = await userRepo.findOne({
			where: { id: input.userId },
			relations: {
				role: true,
				status: true,
			},
		});

		if (!user) {
			throw new DeactivateUserError("USER_NOT_FOUND", "Usuario no encontrado");
		}

		if (user.id === input.performedByUserId) {
			throw new DeactivateUserError(
				"SELF_DEACTIVATION_NOT_ALLOWED",
				"No puedes desactivar tu propio usuario",
			);
		}

		if (user.status.code === "inactive") {
			return user;
		}

		const inactiveStatus = await statusRepo.findOne({
			where: { code: "inactive" },
		});

		if (!inactiveStatus) {
			throw new DeactivateUserError(
				"INACTIVE_STATUS_NOT_FOUND",
				"No existe el estado 'inactive' en user_statuses",
			);
		}

		const deactivateAction = await actionTypeRepo.findOne({
			where: { code: "deactivate_user" },
		});

		if (!deactivateAction) {
			throw new DeactivateUserError(
				"DEACTIVATE_ACTION_NOT_FOUND",
				"No existe la acción 'deactivate_user' en user_admin_action_types",
			);
		}

		const previousStatusId = user.status_id;
		const previousRoleId = user.role_id;

		user.status_id = inactiveStatus.id;
		user.updated_at = new Date();

		await userRepo.save(user);

		const log = logRepo.create({
			target_user_id: user.id,
			performed_by: input.performedByUserId,
			action_type_id: deactivateAction.id,
			previous_status_id: previousStatusId,
			new_status_id: inactiveStatus.id,
			previous_role_id: previousRoleId,
			new_role_id: previousRoleId,
			reason: "Desactivación manual desde administración de usuarios",
			notes: `Usuario desactivado manualmente por ${
				input.performedByEmail ?? "admin"
			}`,
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
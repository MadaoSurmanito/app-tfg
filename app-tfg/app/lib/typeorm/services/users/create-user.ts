import bcrypt from "bcryptjs";
import { getDataSource } from "@/app/lib/typeorm/data-source";
import { User } from "@/app/lib/typeorm/entities/User";
import { UserManagementLog } from "@/app/lib/typeorm/entities/UserManagementLog";
import {
	REQUEST_SOURCE_TYPE_IDS,
	ROLE_IDS,
	USER_ADMIN_ACTION_TYPE_IDS,
	USER_STATUS_IDS,
} from "@/app/lib/typeorm/constants/catalog-ids";

type CreateUserInput = {
	name: string;
	email: string;
	password: string;
	company?: string | null;
	phone?: string | null;
	roleId: number;
	performedByUserId: string;
};

export async function createUser(input: CreateUserInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRepo = manager.getRepository(User);
		const logRepo = manager.getRepository(UserManagementLog);

		const normalizedEmail = input.email.trim().toLowerCase();

		const existingUser = await userRepo.findOne({
			where: { email: normalizedEmail },
		});

		if (existingUser) {
			throw new Error("Ya existe un usuario con ese correo");
		}

		const passwordHash = await bcrypt.hash(input.password, 10);

		const user = userRepo.create({
			name: input.name.trim(),
			email: normalizedEmail,
			password_hash: passwordHash,
			company: input.company?.trim() || null,
			phone: input.phone?.trim() || null,
			role_id: input.roleId,
			status_id: USER_STATUS_IDS.ACTIVE,
			profile_image_url: null,
			last_login_at: null,
		});

		const savedUser = await userRepo.save(user);

		const log = logRepo.create({
			target_user_id: savedUser.id,
			performed_by: input.performedByUserId,
			action_type_id: USER_ADMIN_ACTION_TYPE_IDS.USER_CREATED,
			previous_status_id: null,
			new_status_id: USER_STATUS_IDS.ACTIVE,
			previous_role_id: null,
			new_role_id: input.roleId,
			reason: null,
			notes: "Alta directa desde administración",
		});

		await logRepo.save(log);

		return userRepo.findOne({
			where: { id: savedUser.id },
			relations: {
				role: true,
				status: true,
			},
		});
	});
}

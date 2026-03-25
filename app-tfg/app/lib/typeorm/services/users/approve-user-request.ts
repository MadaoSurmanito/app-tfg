import { getDataSource } from "@/app/lib/typeorm/data-source";
import { User } from "@/app/lib/typeorm/entities/User";
import { UserRequest } from "@/app/lib/typeorm/entities/UserRequest";
import { UserManagementLog } from "@/app/lib/typeorm/entities/UserManagementLog";
import {
	REQUEST_STATUS_IDS,
	USER_ADMIN_ACTION_TYPE_IDS,
	USER_STATUS_IDS,
} from "@/app/lib/typeorm/constants/catalog-ids";

// Aprueba una solicitud pendiente:
// 1) crea el usuario real
// 2) marca la solicitud como aprobada
// 3) registra la acción en user_management_log
export async function approveUserRequest(
	requestId: string,
	performedByUserId: string,
) {
	const ds = await getDataSource();

	console.log(
		"[approveUserRequest] entity metadatas:",
		ds.entityMetadatas.map((m) => m.name),
	);

	console.log(
		"[approveUserRequest] UserRequest metadata match:",
		ds.entityMetadatas.some((m) => m.target === UserRequest),
	);

	return ds.transaction(async (manager) => {
		const userRequestRepo = manager.getRepository("UserRequest");
		const userRepo = manager.getRepository("User");
		const logRepo = manager.getRepository("UserManagementLog");

		const request = await userRequestRepo.findOne({
			where: { id: requestId },
			relations: {
				requestedRole: true,
				status: true,
				requestSourceType: true,
				reviewedByUser: true,
				createdUser: true,
			},
		});

		if (!request) {
			throw new Error("Solicitud no encontrada");
		}

		if (request.status_id !== REQUEST_STATUS_IDS.PENDING) {
			throw new Error("La solicitud no está pendiente");
		}

		const existingUser = await userRepo.findOne({
			where: { email: request.email.toLowerCase() },
		});

		if (existingUser) {
			throw new Error("Ya existe un usuario con ese correo");
		}

		const user = userRepo.create({
			name: request.name,
			email: request.email.toLowerCase(),
			password_hash: request.password_hash,
			company: request.company,
			phone: request.phone,
			role_id: request.requested_role_id,
			status_id: USER_STATUS_IDS.ACTIVE,
			profile_image_url: null,
			last_login_at: null,
		});

		const savedUser = await userRepo.save(user);

		request.status_id = REQUEST_STATUS_IDS.APPROVED;
		request.reviewed_at = new Date();
		request.reviewed_by = performedByUserId;
		request.created_user_id = savedUser.id;

		await userRequestRepo.save(request);

		const log = logRepo.create({
			target_user_id: savedUser.id,
			performed_by: performedByUserId,
			action_type_id: USER_ADMIN_ACTION_TYPE_IDS.USER_APPROVED,
			previous_status_id: null,
			new_status_id: USER_STATUS_IDS.ACTIVE,
			previous_role_id: null,
			new_role_id: savedUser.role_id,
			reason: null,
			notes: `Solicitud aprobada (${request.id}) y usuario creado`,
		});

		await logRepo.save(log);

		return {
			request: await userRequestRepo.findOne({
				where: { id: request.id },
				relations: {
					requestedRole: true,
					status: true,
					requestSourceType: true,
					reviewedByUser: true,
					createdUser: true,
				},
			}),
			user: await userRepo.findOne({
				where: { id: savedUser.id },
				relations: {
					role: true,
					status: true,
				},
			}),
		};
	});
}

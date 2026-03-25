import { getDataSource } from "@/lib/typeorm/data-source";
import { User } from "@/lib/typeorm/entities/User";
import { UserManagementLog } from "@/lib/typeorm/entities/UserManagementLog";
import { UserRequest } from "@/lib/typeorm/entities/UserRequest";
import { RequestStatus } from "@/lib/typeorm/entities/RequestStatus";

import { USER_ADMIN_ACTION_TYPE_IDS } from "../../constants/catalog-ids";

export async function approveUserRequest(
	requestId: string,
	performedByUserId: string,
) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRequestRepo = manager.getRepository(UserRequest);
		const userRepo = manager.getRepository(User);
		const logRepo = manager.getRepository(UserManagementLog);
		const requestStatusRepo = manager.getRepository(RequestStatus);

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

		const [pendingStatus, approvedStatus] = await Promise.all([
			requestStatusRepo.findOne({ where: { code: "pending" } }),
			requestStatusRepo.findOne({ where: { code: "approved" } }),
		]);

		if (!pendingStatus || !approvedStatus) {
			throw new Error("No se pudieron resolver los estados de solicitud");
		}

		if (request.status_id !== pendingStatus.id) {
			throw new Error("La solicitud no está pendiente");
		}

		const existingUser = await userRepo
			.createQueryBuilder("u")
			.where("LOWER(u.email) = LOWER(:email)", {
				email: request.email,
			})
			.getOne();

		if (existingUser) {
			throw new Error("Ya existe un usuario con ese correo");
		}

		const activeUserStatus = 1;

		const user = userRepo.create({
			name: request.name,
			email: request.email.toLowerCase(),
			password_hash: request.password_hash,
			company: request.company,
			phone: request.phone,
			role_id: request.requested_role_id,
			status_id: activeUserStatus,
			profile_image_url: null,
			last_login_at: null,
		});

		const savedUser = await userRepo.save(user);

		const reviewedAt = new Date();

		await userRequestRepo.update(
			{ id: request.id },
			{
				status_id: approvedStatus.id,
				reviewed_at: reviewedAt,
				reviewed_by: performedByUserId,
				created_user_id: savedUser.id,
				rejection_reason: null,
			},
		);

		const refreshedRequest = await userRequestRepo.findOne({
			where: { id: request.id },
			relations: {
				requestedRole: true,
				status: true,
				requestSourceType: true,
				reviewedByUser: true,
				createdUser: true,
			},
		});

		if (!refreshedRequest) {
			throw new Error("No se pudo recargar la solicitud aprobada");
		}

		await logRepo.save(
			logRepo.create({
				target_user_id: savedUser.id,
				performed_by: performedByUserId,
				action_type_id: USER_ADMIN_ACTION_TYPE_IDS.USER_APPROVED,
				previous_status_id: null,
				new_status_id: activeUserStatus,
				previous_role_id: null,
				new_role_id: savedUser.role_id,
				reason: null,
				notes: `Solicitud aprobada (${request.id}) y usuario creado`,
			}),
		);

		return {
			request: refreshedRequest,
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

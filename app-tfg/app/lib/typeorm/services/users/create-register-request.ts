import bcrypt from "bcryptjs";
import { getDataSource } from "@/app/lib/typeorm/data-source";
import { User } from "@/app/lib/typeorm/entities/User";
import { UserRequest } from "@/app/lib/typeorm/entities/UserRequest";
import {
	REQUEST_SOURCE_TYPE_IDS,
	REQUEST_STATUS_IDS,
	ROLE_IDS,
} from "@/app/lib/typeorm/constants/catalog-ids";

type CreateRegisterRequestInput = {
	name: string;
	email: string;
	password: string;
	company?: string | null;
	phone?: string | null;
	roleId?: number;
};

// Crea una solicitud de alta pública.
// No crea el usuario final; solo deja la solicitud pendiente de revisión.
export async function createRegisterRequest(input: CreateRegisterRequestInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRepo = manager.getRepository("User");
		const userRequestRepo = manager.getRepository("UserRequest");

		const normalizedEmail = input.email.trim().toLowerCase();

		const existingUser = await userRepo.findOne({
			where: { email: normalizedEmail },
		});

		if (existingUser) {
			throw new Error("Ya existe un usuario con ese correo");
		}

		const existingRequest = await userRequestRepo.findOne({
			where: { email: normalizedEmail },
		});

		if (existingRequest && existingRequest.status_id === REQUEST_STATUS_IDS.PENDING) {
			throw new Error("Ya existe una solicitud pendiente con ese correo");
		}

		const passwordHash = await bcrypt.hash(input.password, 10);

		const request = userRequestRepo.create({
			name: input.name.trim(),
			email: normalizedEmail,
			password_hash: passwordHash,
			company: input.company?.trim() || null,
			phone: input.phone?.trim() || null,
			requested_role_id: input.roleId ?? ROLE_IDS.CLIENT,
			status_id: REQUEST_STATUS_IDS.PENDING,
			request_source_type_id: REQUEST_SOURCE_TYPE_IDS.SELF_REGISTRATION,
			reviewed_at: null,
			reviewed_by: null,
			rejection_reason: null,
			created_user_id: null,
		});

		const savedRequest = await userRequestRepo.save(request);

		return userRequestRepo.findOne({
			where: { id: savedRequest.id },
			relations: {
				requestedRole: true,
				status: true,
				requestSourceType: true,
				reviewedByUser: true,
				createdUser: true,
			},
		});
	});
}
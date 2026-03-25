import bcrypt from "bcryptjs";
import { getPasswordValidationMessage } from "@/app/lib/password";
import { getDataSource } from "@/app/lib/typeorm/data-source";
import {
	REQUEST_SOURCE_TYPE_IDS,
	REQUEST_STATUS_IDS,
	USER_ADMIN_ACTION_TYPE_IDS,
	USER_STATUS_IDS,
} from "@/app/lib/typeorm/constants/catalog-ids";

type RegisterUserByAdminInput = {
	name: string;
	email: string;
	password: string;
	company?: string | null;
	phone?: string | null;
	roleId: number;
	performedByUserId: string;
};

export class RegisterUserByAdminError extends Error {
	status: number;
	code: string;

	constructor(
		message: string,
		status = 400,
		code = "REGISTER_USER_BY_ADMIN_ERROR",
	) {
		super(message);
		this.name = "RegisterUserByAdminError";
		this.status = status;
		this.code = code;
	}
}

function normalizeText(value: string | null | undefined) {
	return String(value ?? "").trim();
}

function normalizeEmail(value: string | null | undefined) {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

export async function registerUserByAdmin(input: RegisterUserByAdminInput) {
	const name = normalizeText(input.name);
	const email = normalizeEmail(input.email);
	const password = String(input.password ?? "");
	const company = normalizeText(input.company) || null;
	const phone = normalizeText(input.phone) || null;
	const roleId = Number(input.roleId);

	if (!name || !email || !password || !roleId) {
		throw new RegisterUserByAdminError(
			"Faltan campos obligatorios",
			400,
			"INVALID_DATA",
		);
	}

	const passwordValidationMessage = getPasswordValidationMessage(password);

	if (passwordValidationMessage) {
		throw new RegisterUserByAdminError(
			passwordValidationMessage,
			400,
			"PASSWORD_RULES",
		);
	}

	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRepo = manager.getRepository("User");
		const userRequestRepo = manager.getRepository("UserRequest");
		const logRepo = manager.getRepository("UserManagementLog");

		const existingUser = await userRepo
			.createQueryBuilder("u")
			.where("LOWER(u.email) = LOWER(:email)", { email })
			.getOne();

		if (existingUser) {
			throw new RegisterUserByAdminError(
				"Ya existe un usuario con ese correo",
				409,
				"EMAIL_EXISTS",
			);
		}

		const existingPendingRequest = await userRequestRepo
			.createQueryBuilder("ur")
			.where("LOWER(ur.email) = LOWER(:email)", { email })
			.andWhere("ur.status_id = :pendingStatusId", {
				pendingStatusId: REQUEST_STATUS_IDS.PENDING,
			})
			.getOne();

		if (existingPendingRequest) {
			throw new RegisterUserByAdminError(
				"Ya existe una solicitud pendiente con ese correo",
				409,
				"REQUEST_EXISTS",
			);
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const createdUser = await userRepo.save(
			userRepo.create({
				name,
				email,
				password_hash: passwordHash,
				company,
				phone,
				role_id: roleId,
				status_id: USER_STATUS_IDS.ACTIVE,
				profile_image_url: null,
				last_login_at: null,
			}),
		);

		const reviewedAt = new Date();

		const createdRequest = await userRequestRepo.save(
			userRequestRepo.create({
				email,
				password_hash: passwordHash,
				name,
				phone,
				company,
				requested_role_id: roleId,
				status_id: REQUEST_STATUS_IDS.APPROVED,
				request_source_type_id: REQUEST_SOURCE_TYPE_IDS.ADMIN_CREATED,
				requested_at: reviewedAt,
				reviewed_at: reviewedAt,
				reviewed_by: input.performedByUserId,
				rejection_reason: null,
				created_user_id: createdUser.id,
			}),
		);

		await logRepo.save(
			logRepo.create({
				target_user_id: createdUser.id,
				performed_by: input.performedByUserId,
				action_type_id: USER_ADMIN_ACTION_TYPE_IDS.USER_APPROVED,
				previous_status_id: null,
				new_status_id: USER_STATUS_IDS.ACTIVE,
				previous_role_id: null,
				new_role_id: roleId,
				reason: null,
				notes: `Usuario creado directamente por administrador. Request asociada: ${createdRequest.id}`,
			}),
		);

		return {
			user: createdUser,
			request: createdRequest,
		};
	});
}

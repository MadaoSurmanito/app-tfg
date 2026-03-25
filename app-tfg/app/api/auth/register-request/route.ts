import bcrypt from "bcryptjs";
import { getPasswordValidationMessage } from "@/app/lib/password";
import { getDataSource } from "@/app/lib/typeorm/data-source";

export class UpdateUserError extends Error {
	status: number;
	code: string;

	constructor(message: string, status = 400, code = "UPDATE_USER_ERROR") {
		super(message);
		this.name = "UpdateUserError";
		this.status = status;
		this.code = code;
	}
}

type UpdateUserInput = {
	userId: string;
	performedByUserId: string;
	name: string;
	email: string;
	company?: string | null;
	phone?: string | null;
	roleId: number;
	statusId: number;
	password?: string;
	confirmPassword?: string;
};

function normalizeText(value: string | null | undefined) {
	return String(value ?? "").trim();
}

function normalizeEmail(value: string | null | undefined) {
	return String(value ?? "").trim().toLowerCase();
}

type CatalogActionRow = {
	id: number;
	code: string;
};

export async function updateUser(input: UpdateUserInput) {
	const name = normalizeText(input.name);
	const email = normalizeEmail(input.email);
	const company = normalizeText(input.company) || null;
	const phone = normalizeText(input.phone) || null;
	const roleId = Number(input.roleId);
	const statusId = Number(input.statusId);
	const password = String(input.password ?? "");
	const confirmPassword = String(input.confirmPassword ?? "");

	if (!name || !email || !roleId || !statusId) {
		throw new UpdateUserError("Datos inválidos", 400, "INVALID_DATA");
	}

	if (password || confirmPassword) {
		if (password !== confirmPassword) {
			throw new UpdateUserError(
				"Las contraseñas no coinciden",
				400,
				"PASSWORD_MATCH",
			);
		}

		const passwordValidationMessage = getPasswordValidationMessage(password);

		if (passwordValidationMessage) {
			throw new UpdateUserError(
				passwordValidationMessage,
				400,
				"PASSWORD_RULES",
			);
		}
	}

	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRepo = manager.getRepository("User");
		const roleRepo = manager.getRepository("Role");
		const statusRepo = manager.getRepository("UserStatus");
		const actionTypeRepo = manager.getRepository("UserAdminActionType");
		const logRepo = manager.getRepository("UserManagementLog");

		const currentUser = await userRepo.findOne({
			where: { id: input.userId },
		});

		if (!currentUser) {
			throw new UpdateUserError("Usuario no encontrado", 404, "USER_NOT_FOUND");
		}

		const duplicateEmailUser = await userRepo
			.createQueryBuilder("u")
			.where("lower(u.email) = lower(:email)", { email })
			.andWhere("u.id <> :id", { id: input.userId })
			.getOne();

		if (duplicateEmailUser) {
			throw new UpdateUserError("Ya existe un usuario con ese correo", 409, "EMAIL_EXISTS");
		}

		const [newRole, newStatus] = await Promise.all([
			roleRepo.findOne({ where: { id: roleId } }),
			statusRepo.findOne({ where: { id: statusId } }),
		]);

		if (!newRole || !newStatus) {
			throw new UpdateUserError("Datos inválidos", 400, "INVALID_DATA");
		}

		const actionTypes = (await actionTypeRepo
			.createQueryBuilder("uat")
			.where("uat.code IN (:...codes)", {
				codes: ["role_change", "status_change", "password_reset"],
			})
			.getMany()) as CatalogActionRow[];

		const passwordResetActionId = actionTypes.find(
			(row) => row.code === "password_reset",
		)?.id;

		const roleChangeActionId = actionTypes.find(
			(row) => row.code === "role_change",
		)?.id;

		const statusChangeActionId = actionTypes.find(
			(row) => row.code === "status_change",
		)?.id;

		const notesParts: string[] = [];

		if (currentUser.name !== name) {
			notesParts.push(`Nombre: "${currentUser.name}" -> "${name}"`);
		}

		if (currentUser.email !== email) {
			notesParts.push(`Correo: "${currentUser.email}" -> "${email}"`);
		}

		if ((currentUser.company ?? "") !== (company ?? "")) {
			notesParts.push(
				`Empresa: "${currentUser.company ?? "-"}" -> "${company ?? "-"}"`,
			);
		}

		if ((currentUser.phone ?? "") !== (phone ?? "")) {
			notesParts.push(
				`Teléfono: "${currentUser.phone ?? "-"}" -> "${phone ?? "-"}"`,
			);
		}

		const notes = notesParts.length > 0 ? notesParts.join(" | ") : null;

		if (password) {
			currentUser.password_hash = await bcrypt.hash(password, 10);

			if (passwordResetActionId) {
				await logRepo.save(
					logRepo.create({
						target_user_id: input.userId,
						performed_by: input.performedByUserId,
						action_type_id: passwordResetActionId,
						previous_status_id: null,
						new_status_id: null,
						previous_role_id: null,
						new_role_id: null,
						reason: null,
						notes: "Contraseña actualizada por administrador",
					}),
				);
			}
		}

		const previousRoleId = currentUser.role_id;
		const previousStatusId = currentUser.status_id;

		currentUser.name = name;
		currentUser.email = email;
		currentUser.company = company;
		currentUser.phone = phone;
		currentUser.role_id = roleId;
		currentUser.status_id = statusId;
		currentUser.updated_at = new Date();

		await userRepo.save(currentUser);

		if (previousRoleId !== roleId && roleChangeActionId) {
			await logRepo.save(
				logRepo.create({
					target_user_id: input.userId,
					performed_by: input.performedByUserId,
					action_type_id: roleChangeActionId,
					previous_status_id: null,
					new_status_id: null,
					previous_role_id: previousRoleId,
					new_role_id: roleId,
					reason: null,
					notes,
				}),
			);
		}

		if (previousStatusId !== statusId && statusChangeActionId) {
			await logRepo.save(
				logRepo.create({
					target_user_id: input.userId,
					performed_by: input.performedByUserId,
					action_type_id: statusChangeActionId,
					previous_status_id: previousStatusId,
					new_status_id: statusId,
					previous_role_id: null,
					new_role_id: null,
					reason: null,
					notes,
				}),
			);
		}

		return {
			message: "Usuario actualizado correctamente",
			userId: currentUser.id,
		};
	});
}
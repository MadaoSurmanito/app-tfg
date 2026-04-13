import { getDataSource } from "@/lib/typeorm/data-source";
import { ROLE_IDS } from "@/lib/typeorm/constants/catalog-ids";
import { Commercial } from "@/lib/typeorm/entities/Commercial";
import { User } from "@/lib/typeorm/entities/User";

function normalizeText(value: string | null | undefined) {
	return String(value ?? "").trim();
}

type UpsertCommercialProfileInput = {
	userId: string;
	employeeCode?: string | null;
	territory?: string | null;
	notes?: string | null;
};

export class CommercialProfileError extends Error {
	status: number;
	code: string;

	constructor(
		message: string,
		status = 400,
		code = "COMMERCIAL_PROFILE_ERROR",
	) {
		super(message);
		this.name = "CommercialProfileError";
		this.status = status;
		this.code = code;
	}
}

export async function getCommercialById(id: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(Commercial);

	return repo.findOne({
		where: { id },
		relations: {
			user: true,
		},
	});
}

export async function getCommercialByUserId(userId: string) {
	return getCommercialById(userId);
}

export async function requireCommercialByUserId(userId: string) {
	const commercial = await getCommercialByUserId(userId);

	if (!commercial) {
		throw new CommercialProfileError(
			"No existe perfil comercial para este usuario",
			404,
			"COMMERCIAL_PROFILE_NOT_FOUND",
		);
	}

	return commercial;
}

export async function listCommercials() {
	const ds = await getDataSource();
	const repo = ds.getRepository(Commercial);

	return repo.find({
		relations: {
			user: true,
		},
		order: {
			created_at: "DESC",
		},
	});
}

export async function upsertCommercialProfile(
	input: UpsertCommercialProfileInput,
) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const userRepo = manager.getRepository(User);
		const commercialRepo = manager.getRepository(Commercial);

		const user = await userRepo.findOne({
			where: { id: input.userId },
		});

		if (!user) {
			throw new CommercialProfileError(
				"Usuario no encontrado",
				404,
				"USER_NOT_FOUND",
			);
		}

		if (user.role_id !== ROLE_IDS.COMMERCIAL) {
			throw new CommercialProfileError(
				"El usuario indicado no tiene rol comercial",
				400,
				"INVALID_COMMERCIAL_ROLE",
			);
		}

		let commercial = await commercialRepo.findOne({
			where: { id: input.userId },
			relations: {
				user: true,
			},
		});

		if (!commercial) {
			commercial = commercialRepo.create({
				id: input.userId,
				employee_code: null,
				territory: null,
				notes: null,
			});
		}

		if (input.employeeCode !== undefined) {
			commercial.employee_code = normalizeText(input.employeeCode) || null;
		}

		if (input.territory !== undefined) {
			commercial.territory = normalizeText(input.territory) || null;
		}

		if (input.notes !== undefined) {
			commercial.notes = normalizeText(input.notes) || null;
		}

		await commercialRepo.save(commercial);

		return commercialRepo.findOne({
			where: { id: input.userId },
			relations: {
				user: true,
			},
		});
	});
}

import { getDataSource } from "@/lib/typeorm/data-source";
import { CommercialVisit } from "@/lib/typeorm/entities/CommercialVisit";
import { Client } from "@/lib/typeorm/entities/Client";
import { User } from "@/lib/typeorm/entities/User";
import {
	COMMERCIAL_VISIT_STATUS_IDS,
	ROLE_IDS,
} from "@/lib/typeorm/constants/catalog-ids";

// --------------------------------------------------------------------------
// Funciones auxiliares para normalización de datos
// --------------------------------------------------------------------------
function normalizeText(value: string | null | undefined) {
	return String(value ?? "").trim();
}

// --------------------------------------------------------------------------
// Tipos de datos para los inputs de los servicios
// --------------------------------------------------------------------------
type CreateCommercialVisitInput = {
	clientId: string;
	commercialId: string;
	scheduledAt: Date;
	notes?: string | null;
};

type UpdateCommercialVisitInput = {
	visitId: string;
	scheduledAt?: Date;
	statusId?: number;
	notes?: string | null;
	result?: string | null;
};

// --------------------------------------------------------------------------
// SERVICIOS
// --------------------------------------------------------------------------
export class CreateCommercialVisitError extends Error {
	status: number;
	code: string;

	constructor(
		message: string,
		status = 400,
		code = "CREATE_COMMERCIAL_VISIT_ERROR",
	) {
		super(message);
		this.name = "CreateCommercialVisitError";
		this.status = status;
		this.code = code;
	}
}

export class UpdateCommercialVisitError extends Error {
	status: number;
	code: string;

	constructor(
		message: string,
		status = 400,
		code = "UPDATE_COMMERCIAL_VISIT_ERROR",
	) {
		super(message);
		this.name = "UpdateCommercialVisitError";
		this.status = status;
		this.code = code;
	}
}

// Crear visita comercial validando cliente y comercial.
export async function createCommercialVisit(input: CreateCommercialVisitInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const visitRepo = manager.getRepository(CommercialVisit);
		const clientRepo = manager.getRepository(Client);
		const userRepo = manager.getRepository(User);

		if (!input.clientId || !input.commercialId || !(input.scheduledAt instanceof Date)) {
			throw new CreateCommercialVisitError(
				"Faltan datos obligatorios",
				400,
				"INVALID_DATA",
			);
		}

		if (Number.isNaN(input.scheduledAt.getTime())) {
			throw new CreateCommercialVisitError(
				"La fecha de la visita no es válida",
				400,
				"INVALID_DATE",
			);
		}

		const [client, commercial] = await Promise.all([
			clientRepo.findOne({
				where: { id: input.clientId },
			}),
			userRepo.findOne({
				where: { id: input.commercialId },
			}),
		]);

		if (!client) {
			throw new CreateCommercialVisitError(
				"Cliente no encontrado",
				404,
				"CLIENT_NOT_FOUND",
			);
		}

		if (!commercial) {
			throw new CreateCommercialVisitError(
				"Comercial no encontrado",
				404,
				"COMMERCIAL_NOT_FOUND",
			);
		}

		if (commercial.role_id !== ROLE_IDS.COMMERCIAL) {
			throw new CreateCommercialVisitError(
				"El usuario indicado no es un comercial válido",
				400,
				"INVALID_COMMERCIAL_ROLE",
			);
		}

		const visit = visitRepo.create({
			client_id: input.clientId,
			commercial_id: input.commercialId,
			scheduled_at: input.scheduledAt,
			status_id: COMMERCIAL_VISIT_STATUS_IDS.PLANNED,
			notes: normalizeText(input.notes) || null,
			result: null,
		});

		return visitRepo.save(visit);
	});
}

// Obtener visita comercial por su ID, incluyendo relaciones principales.
export async function getCommercialVisitById(id: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(CommercialVisit);

	return repo.findOne({
		where: { id },
		relations: {
			client: true,
			commercial: true,
			status: true,
		},
	});
}

// Listar visitas de un cliente, ordenadas por fecha descendente.
export async function listCommercialVisitsByClient(clientId: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(CommercialVisit);

	return repo.find({
		where: { client_id: clientId },
		relations: {
			client: true,
			commercial: true,
			status: true,
		},
		order: {
			scheduled_at: "DESC",
		},
	});
}

// Actualizar una visita comercial ya existente.
export async function updateCommercialVisit(input: UpdateCommercialVisitInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const repo = manager.getRepository(CommercialVisit);

		const visit = await repo.findOne({
			where: { id: input.visitId },
		});

		if (!visit) {
			throw new UpdateCommercialVisitError(
				"Visita no encontrada",
				404,
				"VISIT_NOT_FOUND",
			);
		}

		if (input.scheduledAt !== undefined) {
			if (!(input.scheduledAt instanceof Date) || Number.isNaN(input.scheduledAt.getTime())) {
				throw new UpdateCommercialVisitError(
					"La fecha de la visita no es válida",
					400,
					"INVALID_DATE",
				);
			}

			visit.scheduled_at = input.scheduledAt;
		}

		if (input.statusId !== undefined) {
			visit.status_id = Number(input.statusId);
		}

		if (input.notes !== undefined) {
			visit.notes = normalizeText(input.notes) || null;
		}

		if (input.result !== undefined) {
			visit.result = normalizeText(input.result) || null;
		}

		await repo.save(visit);

		return repo.findOne({
			where: { id: visit.id },
			relations: {
				client: true,
				commercial: true,
				status: true,
			},
		});
	});
}
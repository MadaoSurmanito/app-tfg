import { getDataSource } from "@/lib/typeorm/data-source";
import { CommercialVisit } from "@/lib/typeorm/entities/CommercialVisit";
import { Client } from "@/lib/typeorm/entities/Client";
import { Commercial } from "@/lib/typeorm/entities/Commercial";
import { Repository } from "typeorm";
import { COMMERCIAL_VISIT_STATUS_IDS } from "@/lib/typeorm/constants/catalog-ids";

// --------------------------------------------------------------------------
// Funciones auxiliares para normalización de datos
// --------------------------------------------------------------------------
function normalizeText(value: string | null | undefined) {
	return String(value ?? "").trim();
}

function buildCommercialVisitQuery(repo: Repository<CommercialVisit>) {
	return repo
		.createQueryBuilder("visit")
		.leftJoinAndSelect("visit.client", "client")
		.leftJoinAndSelect("client.user", "user")
		.leftJoinAndSelect("visit.commercial", "commercial")
		.leftJoinAndSelect("commercial.user", "commercialUser")
		.leftJoinAndSelect("visit.status", "status");
}

function isValidCommercialVisitStatus(statusId: number) {
	return Object.values(COMMERCIAL_VISIT_STATUS_IDS).includes(
		statusId as (typeof COMMERCIAL_VISIT_STATUS_IDS)[keyof typeof COMMERCIAL_VISIT_STATUS_IDS],
	);
}

function canTransitionCommercialVisitStatus(
	currentStatusId: number,
	nextStatusId: number,
) {
	if (currentStatusId === nextStatusId) {
		return true;
	}

	if (currentStatusId === COMMERCIAL_VISIT_STATUS_IDS.PLANNED) {
		return (
			nextStatusId === COMMERCIAL_VISIT_STATUS_IDS.COMPLETED ||
			nextStatusId === COMMERCIAL_VISIT_STATUS_IDS.CANCELLED
		);
	}

	return false;
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
	commercialId: string;
	scheduledAt?: Date;
	statusId?: number;
	notes?: string | null;
	result?: string | null;
};

type ListCommercialVisitsByCommercialInput = {
	commercialId: string;
	clientId?: string | null;
	statusId?: number | null;
	dateFrom?: Date | null;
	dateTo?: Date | null;
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
		const commercialRepo = manager.getRepository(Commercial);

		if (
			!input.clientId ||
			!input.commercialId ||
			!(input.scheduledAt instanceof Date)
		) {
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
			commercialRepo.findOne({
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

		const visit = visitRepo.create({
			client_id: input.clientId,
			commercial_id: input.commercialId,
			scheduled_at: input.scheduledAt,
			status_id: COMMERCIAL_VISIT_STATUS_IDS.PLANNED,
			notes: normalizeText(input.notes) || null,
			result: null,
		});

		await visitRepo.save(visit);

		return buildCommercialVisitQuery(visitRepo)
			.where("visit.id = :visitId", { visitId: visit.id })
			.getOne();
	});
}

// Obtener visita comercial por su ID, incluyendo relaciones principales.
export async function getCommercialVisitById(id: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(CommercialVisit);

	return buildCommercialVisitQuery(repo)
		.where("visit.id = :id", { id })
		.getOne();
}

// Obtener visita comercial por su ID restringiendo el acceso al comercial propietario.
export async function getCommercialVisitByIdForCommercial(
	visitId: string,
	commercialId: string,
) {
	const ds = await getDataSource();
	const repo = ds.getRepository(CommercialVisit);

	return buildCommercialVisitQuery(repo)
		.where("visit.id = :visitId", { visitId })
		.andWhere("visit.commercial_id = :commercialId", { commercialId })
		.getOne();
}

// Listar visitas de un cliente, ordenadas por fecha descendente.
export async function listCommercialVisitsByClient(clientId: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(CommercialVisit);

	return buildCommercialVisitQuery(repo)
		.where("visit.client_id = :clientId", { clientId })
		.orderBy("visit.scheduled_at", "DESC")
		.getMany();
}

// Listar visitas de un comercial, con filtros opcionales por cliente, estado y rango de fechas.
export async function listCommercialVisitsByCommercial(
	input: ListCommercialVisitsByCommercialInput,
) {
	const ds = await getDataSource();
	const repo = ds.getRepository(CommercialVisit);

	const query = buildCommercialVisitQuery(repo)
		.where("visit.commercial_id = :commercialId", {
			commercialId: input.commercialId,
		})
		.orderBy("visit.scheduled_at", "DESC");

	if (input.clientId) {
		query.andWhere("visit.client_id = :clientId", {
			clientId: input.clientId,
		});
	}

	if (input.statusId) {
		query.andWhere("visit.status_id = :statusId", {
			statusId: input.statusId,
		});
	}

	if (input.dateFrom) {
		query.andWhere("visit.scheduled_at >= :dateFrom", {
			dateFrom: input.dateFrom,
		});
	}

	if (input.dateTo) {
		query.andWhere("visit.scheduled_at <= :dateTo", {
			dateTo: input.dateTo,
		});
	}

	return query.getMany();
}

// Actualizar una visita comercial ya existente.
export async function updateCommercialVisit(input: UpdateCommercialVisitInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const repo = manager.getRepository(CommercialVisit);

		const visit = await repo.findOne({
			where: {
				id: input.visitId,
				commercial_id: input.commercialId,
			},
		});

		if (!visit) {
			throw new UpdateCommercialVisitError(
				"Visita no encontrada",
				404,
				"VISIT_NOT_FOUND",
			);
		}

		if (input.scheduledAt !== undefined) {
			if (
				!(input.scheduledAt instanceof Date) ||
				Number.isNaN(input.scheduledAt.getTime())
			) {
				throw new UpdateCommercialVisitError(
					"La fecha de la visita no es válida",
					400,
					"INVALID_DATE",
				);
			}

			if (visit.status_id !== COMMERCIAL_VISIT_STATUS_IDS.PLANNED) {
				throw new UpdateCommercialVisitError(
					"Solo se puede reprogramar una visita planificada",
					409,
					"VISIT_NOT_EDITABLE",
				);
			}

			visit.scheduled_at = input.scheduledAt;
		}

		const nextStatusId =
			input.statusId !== undefined ? Number(input.statusId) : visit.status_id;

		const nextResult =
			input.result !== undefined
				? normalizeText(input.result) || null
				: visit.result;

		if (input.statusId !== undefined) {
			if (!isValidCommercialVisitStatus(nextStatusId)) {
				throw new UpdateCommercialVisitError(
					"El estado indicado no es válido",
					400,
					"INVALID_STATUS",
				);
			}

			if (!canTransitionCommercialVisitStatus(visit.status_id, nextStatusId)) {
				throw new UpdateCommercialVisitError(
					"No se permite ese cambio de estado para la visita",
					409,
					"INVALID_STATUS_TRANSITION",
				);
			}
		}

		if (nextStatusId === COMMERCIAL_VISIT_STATUS_IDS.COMPLETED && !nextResult) {
			throw new UpdateCommercialVisitError(
				"Para completar una visita debes indicar un resultado",
				400,
				"RESULT_REQUIRED_FOR_COMPLETION",
			);
		}

		if (input.notes !== undefined) {
			visit.notes = normalizeText(input.notes) || null;
		}

		visit.status_id = nextStatusId;
		visit.result = nextResult;

		await repo.save(visit);

		return buildCommercialVisitQuery(repo)
			.where("visit.id = :visitId", { visitId: visit.id })
			.getOne();
	});
}

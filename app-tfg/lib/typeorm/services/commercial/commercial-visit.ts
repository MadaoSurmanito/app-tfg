import { getDataSource } from "@/lib/typeorm/data-source";
import { CommercialVisit } from "@/lib/typeorm/entities/CommercialVisit";
import { COMMERCIAL_VISIT_STATUS_IDS } from "@/lib/typeorm/constants/catalog-ids";

// --------------------------------------------------------------------------
// Tipos de datos
// --------------------------------------------------------------------------
type CreateCommercialVisitInput = {
	clientId: string;
	commercialId: string;
	scheduledAt: Date;
	notes?: string;
};

// --------------------------------------------------------------------------
// SERVICIOS
// --------------------------------------------------------------------------

// Crear visita comercial
export async function createCommercialVisit(input: CreateCommercialVisitInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const repo = manager.getRepository(CommercialVisit);

		const visit = repo.create({
			client_id: input.clientId,
			commercial_id: input.commercialId,
			scheduled_at: input.scheduledAt,
			status_id: COMMERCIAL_VISIT_STATUS_IDS.PLANNED,
			notes: input.notes ?? null,
		});

		return repo.save(visit);
	});
}

// Listar visitas de un cliente
export async function listCommercialVisitsByClient(clientId: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(CommercialVisit);

	return repo.find({
		where: { client_id: clientId },
		relations: {
			commercial: true,
			status: true,
		},
		order: { scheduled_at: "DESC" },
	});
}
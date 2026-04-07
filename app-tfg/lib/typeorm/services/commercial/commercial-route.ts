import { getDataSource } from "@/lib/typeorm/data-source";
import { CommercialRoute } from "@/lib/typeorm/entities/CommercialRoute";
import { RouteVisit } from "@/lib/typeorm/entities/RouteVisit";
import { COMMERCIAL_ROUTE_STATUS_IDS } from "@/lib/typeorm/constants/catalog-ids";

// --------------------------------------------------------------------------
// Tipos de datos
// --------------------------------------------------------------------------
type CreateRouteInput = {
	commercialId: string;
	date: string;
	name: string;
};

type AddVisitToRouteInput = {
	routeId: string;
	visitId: string;
	order: number;
};

// --------------------------------------------------------------------------
// SERVICIOS
// --------------------------------------------------------------------------

// Crear ruta comercial
export async function createCommercialRoute(input: CreateRouteInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const repo = manager.getRepository(CommercialRoute);

		const route = repo.create({
			commercial_id: input.commercialId,
			route_date: input.date,
			name: input.name,
			status_id: COMMERCIAL_ROUTE_STATUS_IDS.PLANNED,
		});

		return repo.save(route);
	});
}

// Añadir visita a ruta
export async function addVisitToRoute(input: AddVisitToRouteInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const repo = manager.getRepository(RouteVisit);

		const routeVisit = repo.create({
			route_id: input.routeId,
			visit_id: input.visitId,
			visit_order: input.order,
		});

		return repo.save(routeVisit);
	});
}
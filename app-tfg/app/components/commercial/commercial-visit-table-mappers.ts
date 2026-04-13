import type { EntityTableItem } from "@/app/components/entity-table/entity-table-types";

import type { CommercialVisit } from "./commercial-visit-types";
import {
	formatVisitDateTime,
	getVisitStatusLabel,
} from "./commercial-visit-types";

export function mapCommercialVisitsToEntityTableItems(
	visits: CommercialVisit[],
): EntityTableItem[] {
	return visits.map((visit) => {
		const location =
			[visit.client?.city, visit.client?.province]
				.filter(Boolean)
				.join(" · ") || "-";

		return {
			id: visit.id,
			title: visit.client?.name ?? "Cliente",
			subtitle:
				visit.client?.contact_name ||
				visit.client?.linkedUser?.email ||
				"Sin persona de contacto",
			imageUrl: visit.client?.linkedUser?.profile_image_url ?? null,
			category: visit.client?.province || "Sin provincia",
			status: getVisitStatusLabel(visit.status_id),
			primaryDate: visit.scheduled_at,
			secondaryDate: null,
			badges: [
				{
					label: formatVisitDateTime(visit.scheduled_at),
					className: "bg-slate-100 text-slate-700",
				},
			],
			fields: [
				{
					label: "Correo",
					value: visit.client?.linkedUser?.email || "-",
				},
				{
					label: "Ubicación",
					value: location,
				},
				{
					label: "Estado",
					value: getVisitStatusLabel(visit.status_id),
				},
				{
					label: "Notas",
					value: visit.notes || "-",
				},
			],
			actions: [
				{
					label: "Ver detalle",
					href: `/commercials/visits/${visit.id}`,
					variant: "primary",
				},
			],
			searchText: [
				visit.client?.name,
				visit.client?.contact_name,
				visit.client?.linkedUser?.email,
				visit.client?.city,
				visit.client?.province,
				visit.notes,
				visit.result,
				getVisitStatusLabel(visit.status_id),
			]
				.filter(Boolean)
				.join(" "),
		};
	});
}

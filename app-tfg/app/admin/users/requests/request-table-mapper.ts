import type { EntityTableItem } from "@/app/components/entity-table/entity-table-types";
import type { UserRequest } from "@/lib/typeorm/entities/UserRequest";

// Adapta una entidad UserRequest al formato visual reutilizable EntityTableItem.
export function mapRequestToEntityTableItem(
	request: UserRequest,
): EntityTableItem {
	return {
		id: request.id,
		title: request.name,
		subtitle: request.email,
		imageUrl: null,
		category: request.requestedRole.name,
		status: "Pendiente",
		primaryDate: request.requested_at.toISOString(),
		secondaryDate: null,
		badges: [
			{
				label: request.requestedRole.name,
				className: "bg-sky-100 text-sky-700",
			},
			{
				label: "Pendiente",
				className: "bg-amber-100 text-amber-700",
			},
		],
		fields: [
			{ label: "Empresa", value: request.company || "-" },
			{ label: "Teléfono", value: request.phone || "-" },
			{ label: "Solicitud", value: request.requested_at.toLocaleDateString("es-ES") },
			{ label: "Estado", value: "Pendiente" },
		],
		actions: [
			{
				label: "Revisar",
				href: `/admin/users/requests/${request.id}`,
				variant: "primary",
			},
		],
		searchText: [
			request.name,
			request.email,
			request.company,
			request.phone,
			request.requestedRole.name,
			"pendiente",
		]
			.filter(Boolean)
			.join(" "),
	};
}
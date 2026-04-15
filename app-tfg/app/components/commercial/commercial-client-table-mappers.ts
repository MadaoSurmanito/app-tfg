import type { EntityTableItem } from "@/app/components/entity-table/entity-table-types";

import {
	type CommercialClient,
	getActiveAssignment,
	getClientLocation,
	getCommercialDisplayName,
} from "./commercial-client-types";

export function mapCommercialClientsToEntityTableItems(
	clients: CommercialClient[],
): EntityTableItem[] {
	return clients.map((client) => {
		const activeAssignment = getActiveAssignment(client);

		return {
			id: client.id,
			title: client.name,
			subtitle:
				client.contact_name ||
				client.user?.email ||
				"Sin persona de contacto",
			imageUrl: client.user?.profile_image_url ?? null,
			category: client.province || "Sin provincia",
			status: activeAssignment ? "Asignado" : "Sin asignación",
			primaryDate: activeAssignment?.assigned_at ?? client.created_at,
			secondaryDate: client.updated_at,
			badges: [
				client.tax_id
					? {
							label: client.tax_id,
							className: "bg-slate-100 text-slate-700",
						}
					: null,
				activeAssignment?.commercial?.territory
					? {
							label: activeAssignment.commercial.territory,
							className: "bg-indigo-50 text-indigo-700",
						}
					: null,
			].filter(Boolean) as NonNullable<EntityTableItem["badges"]>,
			fields: [
				{
					label: "Contacto",
					value: client.contact_name || "-",
				},
				{
					label: "Correo",
					value: client.user?.email || "-",
				},
				{
					label: "Teléfono",
					value: client.user?.phone || "-",
				},
				{
					label: "Ubicación",
					value: getClientLocation(client),
				},
				{
					label: "Comercial",
					value: getCommercialDisplayName(client),
				},
			],
			actions: [
				{
					label: "Ver ficha",
					href: `/commercials/clients/${client.id}`,
					variant: "primary",
				},
			],
			searchText: [
				client.name,
				client.contact_name,
				client.tax_id,
				client.address,
				client.city,
				client.postal_code,
				client.province,
				client.notes,
				client.user?.name,
				client.user?.email,
				client.user?.phone,
				activeAssignment?.commercial?.user?.name,
				activeAssignment?.commercial?.employee_code,
				activeAssignment?.commercial?.territory,
			]
				.filter(Boolean)
				.join(" "),
		};
	});
}

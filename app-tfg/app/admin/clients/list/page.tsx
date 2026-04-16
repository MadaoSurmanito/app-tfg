import EntityTable from "@/app/components/entity-table/EntityTable";
import type { EntityTableItem } from "@/app/components/entity-table/entity-table-types";
import { listClients } from "@/lib/typeorm/services/commercial/client";

function formatDate(value?: Date | string | null) {
	if (!value) return "-";

	const date = value instanceof Date ? value : new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return date.toLocaleString("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

function mapClientsToEntityTableItems(clients: any[]): EntityTableItem[] {
	return clients.map((client) => {
		const activeAssignment = Array.isArray(client.commercialAssignments)
			? client.commercialAssignments[0] ?? null
			: null;

		const assignedCommercial = activeAssignment?.commercial ?? null;
		const assignedCommercialUser = assignedCommercial?.user ?? null;

		const assignedCommercialName =
			assignedCommercialUser?.name?.trim() || "Sin comercial asignado";

		const assignedCommercialEmail =
			assignedCommercialUser?.email?.trim() || "-";

		return {
			id: client.id,
			title: client.name,
			subtitle:
				client.contact_name ||
				client.user?.email ||
				"Sin persona de contacto",
			imageUrl: client.user?.profile_image_url ?? null,
			category: client.province || client.city || null,
			status: assignedCommercial ? "Asignado" : "Sin asignar",
			primaryDate: client.created_at
				? new Date(client.created_at).toISOString()
				: null,
			badges: assignedCommercial
				? [
						{
							label: assignedCommercialName,
							className:
								"bg-cyan-100 text-cyan-800 border border-cyan-200",
						},
					]
				: [
						{
							label: "Pendiente de asignación",
							className:
								"bg-amber-100 text-amber-800 border border-amber-200",
						},
					],
			fields: [
				{
					label: "Correo",
					value: client.user?.email || "-",
				},
				{
					label: "Teléfono",
					value: client.user?.phone || "-",
				},
				{
					label: "Ciudad",
					value: client.city || "-",
				},
				{
					label: "Provincia",
					value: client.province || "-",
				},
				{
					label: "Comercial asignado",
					value: assignedCommercialName,
				},
				{
					label: "Correo comercial",
					value: assignedCommercialEmail,
				},
				{
					label: "Fecha asignación",
					value: formatDate(activeAssignment?.assigned_at),
				},
			],
			actions: [
				{
					label: "Ver detalle",
					href: `/admin/clients/list/${client.id}`,
					variant: "primary",
				},
				{
					label: "Gestionar asignación",
					href: `/admin/clients/assignments?clientId=${client.id}`,
					variant: "secondary",
				},
			],
			searchText: [
				client.name,
				client.contact_name,
				client.city,
				client.province,
				client.user?.name,
				client.user?.email,
				client.user?.phone,
				assignedCommercialUser?.name,
				assignedCommercialUser?.email,
			]
				.filter(Boolean)
				.join(" "),
		};
	});
}

export default async function AdminClientsPage() {
	const clients = await listClients();
	const items = mapClientsToEntityTableItems(clients);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap gap-3 text-sm text-slate-600">
				<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
					<span className="font-semibold text-slate-900">
						{clients.length}
					</span>{" "}
					clientes totales
				</div>

				<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
					<span className="font-semibold text-slate-900">
						{
							clients.filter(
								(client) =>
									Array.isArray(client.commercialAssignments) &&
									client.commercialAssignments.length > 0,
							).length
						}
					</span>{" "}
					con comercial asignado
				</div>

				<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
					<span className="font-semibold text-slate-900">
						{
							clients.filter(
								(client) =>
									!Array.isArray(client.commercialAssignments) ||
									client.commercialAssignments.length === 0,
							).length
						}
					</span>{" "}
					sin asignación activa
				</div>
			</div>

			<EntityTable
				items={items}
				config={{
					categoryLabel: "Provincia",
					statusLabel: "Asignación",
					showImageFilter: true,
					emptyMessage: "No hay clientes registrados.",
				}}
			/>
		</div>
	);
}
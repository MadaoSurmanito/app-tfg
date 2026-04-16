import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PageTransition from "@/app/components/animations/PageTransition";
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
			? (client.commercialAssignments[0] ?? null)
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
				client.contact_name || client.user?.email || "Sin persona de contacto",
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
							className: "bg-cyan-100 text-cyan-800 border border-cyan-200",
						},
					]
				: [
						{
							label: "Pendiente de asignación",
							className: "bg-amber-100 text-amber-800 border border-amber-200",
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
					href: `/admin/clients/${client.id}`,
					variant: "primary",
				},
				{
					label: "Gestionar asignación",
					href: "/admin/client-commercial-assignments",
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
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role !== "admin") {
		redirect("/");
	}

	const clients = await listClients();
	const items = mapClientsToEntityTableItems(clients);

	return (
		<PageTransition>
			<div className="space-y-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-medium uppercase tracking-wide text-slate-500">
							M2 · Gestión comercial
						</p>
						<h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
						<p className="mt-2 max-w-3xl text-sm text-slate-600">
							Aquí puedes revisar todos los clientes del sistema y ver qué
							comercial tienen asignado actualmente.
						</p>
					</div>

					<Link
						href="/admin"
						className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
					>
						Volver al panel admin
					</Link>
				</div>

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
		</PageTransition>
	);
}

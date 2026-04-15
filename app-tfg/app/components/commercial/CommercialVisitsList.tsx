"use client";

import { useEffect, useMemo, useState } from "react";
import H1Title from "@/app/components/H1Title";
import PageTransition from "@/app/components/animations/PageTransition";
import EntityTable from "@/app/components/entity-table/EntityTable";
import SafeForm from "@/app/components/forms/SafeForm";
import SubmitButton from "@/app/components/forms/SubmitButton";

import type { CommercialClient } from "./commercial-client-types";
import type { CommercialVisit } from "./commercial-visit-types";
import {
	COMMERCIAL_VISIT_STATUS_OPTIONS,
	getVisitStatusLabel,
} from "./commercial-visit-types";
import { mapCommercialVisitsToEntityTableItems } from "./commercial-visit-table-mappers";

type ApiErrorResponse = {
	error?: string;
	code?: string;
};

function toApiDateStart(value: string) {
	if (!value) return null;
	return `${value}T00:00:00`;
}

function toApiDateEnd(value: string) {
	if (!value) return null;
	return `${value}T23:59:59`;
}

function buildVisitsQuery(params: {
	clientId?: string;
	statusId?: string;
	dateFrom?: string;
	dateTo?: string;
}) {
	const searchParams = new URLSearchParams();

	if (params.clientId) {
		searchParams.set("clientId", params.clientId);
	}

	if (params.statusId) {
		searchParams.set("statusId", params.statusId);
	}

	if (params.dateFrom) {
		const parsed = toApiDateStart(params.dateFrom);
		if (parsed) {
			searchParams.set("dateFrom", parsed);
		}
	}

	if (params.dateTo) {
		const parsed = toApiDateEnd(params.dateTo);
		if (parsed) {
			searchParams.set("dateTo", parsed);
		}
	}

	const query = searchParams.toString();

	return query ? `/api/commercial/visits?${query}` : "/api/commercial/visits";
}

export default function CommercialVisitsList() {
	const [visits, setVisits] = useState<CommercialVisit[]>([]);
	const [clients, setClients] = useState<CommercialClient[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");

	// --------------------------------------------------------------------------
	// Formulario de creación
	// --------------------------------------------------------------------------
	const [clientId, setClientId] = useState("");
	const [scheduledAt, setScheduledAt] = useState("");
	const [notes, setNotes] = useState("");

	// --------------------------------------------------------------------------
	// Filtros del listado
	// --------------------------------------------------------------------------
	const [filterClientId, setFilterClientId] = useState("");
	const [filterStatusId, setFilterStatusId] = useState("");
	const [filterDateFrom, setFilterDateFrom] = useState("");
	const [filterDateTo, setFilterDateTo] = useState("");

	async function loadClients() {
		const response = await fetch("/api/commercial/clients?scope=all", {
			method: "GET",
			cache: "no-store",
		});

		const data = (await response.json()) as
			| CommercialClient[]
			| ApiErrorResponse;

		if (!response.ok) {
			throw new Error(
				"error" in data && data.error
					? data.error
					: "No se pudieron obtener los clientes",
			);
		}

		return Array.isArray(data) ? data : [];
	}

	async function loadVisits(filters?: {
		clientId?: string;
		statusId?: string;
		dateFrom?: string;
		dateTo?: string;
	}) {
		const response = await fetch(
			buildVisitsQuery({
				clientId: filters?.clientId ?? filterClientId,
				statusId: filters?.statusId ?? filterStatusId,
				dateFrom: filters?.dateFrom ?? filterDateFrom,
				dateTo: filters?.dateTo ?? filterDateTo,
			}),
			{
				method: "GET",
				cache: "no-store",
			},
		);

		const data = (await response.json()) as
			| CommercialVisit[]
			| ApiErrorResponse;

		if (!response.ok) {
			throw new Error(
				"error" in data && data.error
					? data.error
					: "No se pudieron obtener las visitas",
			);
		}

		return Array.isArray(data) ? data : [];
	}

	async function loadData() {
		try {
			setLoading(true);
			setError("");

			const [visitsData, clientsData] = await Promise.all([
				loadVisits(),
				loadClients(),
			]);

			setVisits(visitsData);
			setClients(clientsData);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Error al cargar las visitas",
			);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadData();
	}, []);

	useEffect(() => {
		let ignore = false;

		async function reloadVisitsByFilters() {
			try {
				setLoading(true);
				setError("");

				const visitsData = await loadVisits({
					clientId: filterClientId,
					statusId: filterStatusId,
					dateFrom: filterDateFrom,
					dateTo: filterDateTo,
				});

				if (!ignore) {
					setVisits(visitsData);
				}
			} catch (err) {
				if (!ignore) {
					setError(
						err instanceof Error ? err.message : "Error al filtrar las visitas",
					);
				}
			} finally {
				if (!ignore) {
					setLoading(false);
				}
			}
		}

		void reloadVisitsByFilters();

		return () => {
			ignore = true;
		};
	}, [filterClientId, filterStatusId, filterDateFrom, filterDateTo]);

	const tableItems = useMemo(
		() => mapCommercialVisitsToEntityTableItems(visits),
		[visits],
	);

	const stats = useMemo(() => {
		const planned = visits.filter((visit) => visit.status_id === 1).length;
		const completed = visits.filter((visit) => visit.status_id === 2).length;
		const cancelled = visits.filter((visit) => visit.status_id === 3).length;

		return {
			total: visits.length,
			planned,
			completed,
			cancelled,
		};
	}, [visits]);

	async function handleCreateVisit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		try {
			setSaving(true);
			setFormError("");
			setFormSuccess("");

			const response = await fetch("/api/commercial/visits", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					clientId,
					scheduledAt,
					notes,
				}),
			});

			const data = (await response.json()) as
				| ApiErrorResponse
				| CommercialVisit;

			if (!response.ok) {
				throw new Error(
					"error" in data && data.error
						? data.error
						: "No se pudo crear la visita",
				);
			}

			setClientId("");
			setScheduledAt("");
			setNotes("");
			setFormSuccess("Visita creada correctamente.");

			const refreshedVisits = await loadVisits({
				clientId: filterClientId,
				statusId: filterStatusId,
				dateFrom: filterDateFrom,
				dateTo: filterDateTo,
			});

			setVisits(refreshedVisits);
		} catch (err) {
			setFormError(
				err instanceof Error ? err.message : "Error al crear la visita",
			);
		} finally {
			setSaving(false);
		}
	}

	function handleClearFilters() {
		setFilterClientId("");
		setFilterStatusId("");
		setFilterDateFrom("");
		setFilterDateTo("");
	}

	return (
		<PageTransition>
			<div className="space-y-6">
				<H1Title
					title="Mis visitas"
					subtitle="Planifica nuevas visitas comerciales, consulta tu histórico y filtra el trabajo diario desde un único listado."
				/>

				<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
					<div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-600">
						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{stats.total}
							</span>{" "}
							visitas mostradas
						</div>

						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{clients.length}
							</span>{" "}
							clientes disponibles para programar visitas
						</div>

						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{stats.planned}
							</span>{" "}
							planificadas
						</div>

						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{stats.completed}
							</span>{" "}
							completadas
						</div>

						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{stats.cancelled}
							</span>{" "}
							canceladas
						</div>
					</div>

					<SafeForm
						onSubmit={handleCreateVisit}
						className="grid gap-4 md:grid-cols-2"
					>
						<div>
							<label className="mb-2 block text-sm font-medium text-slate-700">
								Cliente
							</label>
							<select
								value={clientId}
								onChange={(e) => setClientId(e.target.value)}
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								required
							>
								<option value="">Selecciona un cliente</option>
								{clients.map((client) => (
									<option key={client.id} value={client.id}>
										{client.name}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="mb-2 block text-sm font-medium text-slate-700">
								Fecha y hora
							</label>
							<input
								type="datetime-local"
								value={scheduledAt}
								onChange={(e) => setScheduledAt(e.target.value)}
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								required
							/>
						</div>

						<div className="md:col-span-2">
							<label className="mb-2 block text-sm font-medium text-slate-700">
								Notas
							</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={4}
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								placeholder="Objetivo de la visita, observaciones previas o puntos a revisar..."
							/>
						</div>

						<div className="md:col-span-2 flex flex-wrap items-center gap-3">
							<SubmitButton
								isSubmitting={saving}
								submittingText="Guardando..."
								className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
							>
								Crear visita
							</SubmitButton>

							{formSuccess ? (
								<p className="text-sm font-medium text-emerald-700">
									{formSuccess}
								</p>
							) : null}

							{formError ? (
								<p className="text-sm font-medium text-red-600">{formError}</p>
							) : null}
						</div>
					</SafeForm>
				</section>

				<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
					<div className="mb-5 flex flex-col gap-4">
						<div>
							<h2 className="text-lg font-semibold text-slate-900">
								Filtros del listado
							</h2>
							<p className="mt-1 text-sm text-slate-600">
								Filtra por cliente, estado y rango de fechas sin salir del
								listado.
							</p>
						</div>

						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700">
									Cliente
								</label>
								<select
									value={filterClientId}
									onChange={(e) => setFilterClientId(e.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								>
									<option value="">Todos los clientes</option>
									{clients.map((client) => (
										<option key={client.id} value={client.id}>
											{client.name}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700">
									Estado
								</label>
								<select
									value={filterStatusId}
									onChange={(e) => setFilterStatusId(e.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								>
									<option value="">Todos los estados</option>
									{COMMERCIAL_VISIT_STATUS_OPTIONS.map((status) => (
										<option key={status.id} value={String(status.id)}>
											{status.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700">
									Desde
								</label>
								<input
									type="date"
									value={filterDateFrom}
									onChange={(e) => setFilterDateFrom(e.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700">
									Hasta
								</label>
								<input
									type="date"
									value={filterDateTo}
									onChange={(e) => setFilterDateTo(e.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								/>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3 text-sm">
							<button
								type="button"
								onClick={handleClearFilters}
								className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
							>
								Limpiar filtros
							</button>

							<div className="text-slate-600">
								Estado actual:{" "}
								<span className="font-medium text-slate-900">
									{filterStatusId
										? getVisitStatusLabel(Number(filterStatusId))
										: "Todos"}
								</span>
							</div>
						</div>
					</div>
				</section>

				{loading ? (
					<section className="glass-card rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
						<p className="text-sm text-slate-600">Cargando visitas...</p>
					</section>
				) : null}

				{!loading && error ? (
					<section className="glass-card rounded-3xl border border-red-200 bg-red-50/80 p-6 shadow-xl backdrop-blur">
						<h2 className="text-lg font-semibold text-red-700">
							No se pudieron cargar las visitas
						</h2>
						<p className="mt-2 text-sm text-red-600">{error}</p>
					</section>
				) : null}

				{!loading && !error ? (
					<EntityTable
						items={tableItems}
						config={{
							categoryLabel: "Provincia",
							statusLabel: "Estado",
							showImageFilter: true,
							emptyMessage:
								"No hay visitas que coincidan con los filtros actuales.",
						}}
					/>
				) : null}
			</div>
		</PageTransition>
	);
}

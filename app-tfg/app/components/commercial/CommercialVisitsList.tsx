"use client";

import { useEffect, useMemo, useState } from "react";

import H1Title from "@/app/components/H1Title";
import PageTransition from "@/app/components/animations/PageTransition";
import EntityTable from "@/app/components/entity-table/EntityTable";
import SafeForm from "@/app/components/forms/SafeForm";
import SubmitButton from "@/app/components/forms/SubmitButton";

import type { CommercialClient } from "./commercial-client-types";
import type { CommercialVisit } from "./commercial-visit-types";
import { mapCommercialVisitsToEntityTableItems } from "./commercial-visit-table-mappers";

type ApiErrorResponse = {
	error?: string;
	code?: string;
};

export default function CommercialVisitsList() {
	const [visits, setVisits] = useState<CommercialVisit[]>([]);
	const [clients, setClients] = useState<CommercialClient[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");

	const [clientId, setClientId] = useState("");
	const [scheduledAt, setScheduledAt] = useState("");
	const [notes, setNotes] = useState("");

	async function loadData() {
		try {
			setLoading(true);
			setError("");

			const [visitsResponse, clientsResponse] = await Promise.all([
				fetch("/api/commercial/visits", {
					method: "GET",
					cache: "no-store",
				}),
				fetch("/api/commercial/clients", {
					method: "GET",
					cache: "no-store",
				}),
			]);

			const visitsData = (await visitsResponse.json()) as
				| CommercialVisit[]
				| ApiErrorResponse;
			const clientsData = (await clientsResponse.json()) as
				| CommercialClient[]
				| ApiErrorResponse;

			if (!visitsResponse.ok) {
				throw new Error(
					"error" in visitsData && visitsData.error
						? visitsData.error
						: "No se pudieron obtener las visitas",
				);
			}

			if (!clientsResponse.ok) {
				throw new Error(
					"error" in clientsData && clientsData.error
						? clientsData.error
						: "No se pudieron obtener los clientes",
				);
			}

			setVisits(Array.isArray(visitsData) ? visitsData : []);
			setClients(Array.isArray(clientsData) ? clientsData : []);
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

	const tableItems = useMemo(
		() => mapCommercialVisitsToEntityTableItems(visits),
		[visits],
	);

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

			await loadData();
		} catch (err) {
			setFormError(
				err instanceof Error ? err.message : "Error al crear la visita",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<PageTransition>
			<div className="space-y-6">
				<H1Title
					title="Mis visitas"
					subtitle="Planifica nuevas visitas comerciales, consulta tu histórico y accede al detalle de cada visita desde un único listado."
				/>

				<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
					<div className="mb-5 flex flex-wrap gap-3 text-sm text-slate-600">
						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{visits.length}
							</span>{" "}
							visitas registradas
						</div>

						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{clients.length}
							</span>{" "}
							clientes disponibles
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

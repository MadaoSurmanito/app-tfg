"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PageTransition from "@/app/components/animations/PageTransition";

import type { CommercialClient } from "./commercial-client-types";
import {
	type CommercialVisit,
	COMMERCIAL_VISIT_STATUS_OPTIONS,
	formatVisitDateTime,
	getVisitStatusClasses,
	getVisitStatusLabel,
} from "./commercial-visit-types";

type ApiErrorResponse = {
	error?: string;
	code?: string;
};

function normalizeValue(value: string | null | undefined) {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

export default function CommercialVisitsList() {
	const [visits, setVisits] = useState<CommercialVisit[]>([]);
	const [clients, setClients] = useState<CommercialClient[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const [clientId, setClientId] = useState("");
	const [scheduledAt, setScheduledAt] = useState("");
	const [notes, setNotes] = useState("");
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");

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

	const filteredVisits = useMemo(() => {
		const normalizedSearch = normalizeValue(search);

		return visits.filter((visit) => {
			const matchesStatus =
				statusFilter === "all" || String(visit.status_id) === statusFilter;

			if (!matchesStatus) {
				return false;
			}

			if (!normalizedSearch) {
				return true;
			}

			const haystack = [
				visit.client?.name,
				visit.client?.contact_name,
				visit.client?.linkedUser?.email,
				visit.client?.city,
				visit.client?.province,
				visit.notes,
				visit.result,
				visit.commercial?.user?.name,
				getVisitStatusLabel(visit.status_id),
			]
				.map((value) => normalizeValue(value))
				.join(" ");

			return haystack.includes(normalizedSearch);
		});
	}, [search, statusFilter, visits]);

	async function handleCreateVisit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

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
				<section className="glass-card rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
						M2 · Gestión comercial
					</p>

					<h1 className="text-3xl font-bold text-slate-900">Mis visitas</h1>

					<p className="mt-2 max-w-3xl text-sm text-slate-600">
						Planifica tus próximas visitas comerciales, consulta el histórico
						reciente y abre el detalle de cada visita para actualizar su estado
						y resultado.
					</p>
				</section>

				<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
					<h2 className="text-xl font-bold text-slate-900">Nueva visita</h2>

					<form
						onSubmit={handleCreateVisit}
						className="mt-5 grid gap-4 md:grid-cols-2"
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
								placeholder="Objetivo de la visita, observaciones previas, puntos a revisar..."
							/>
						</div>

						<div className="md:col-span-2 flex flex-wrap items-center gap-3">
							<button
								type="submit"
								disabled={saving}
								className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{saving ? "Guardando..." : "Crear visita"}
							</button>

							{formSuccess ? (
								<p className="text-sm font-medium text-emerald-700">
									{formSuccess}
								</p>
							) : null}

							{formError ? (
								<p className="text-sm font-medium text-red-600">{formError}</p>
							) : null}
						</div>
					</form>
				</section>

				<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div className="w-full lg:max-w-md">
							<label className="mb-2 block text-sm font-medium text-slate-700">
								Buscar
							</label>

							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Cliente, ciudad, notas, estado..."
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
							/>
						</div>

						<div className="w-full lg:max-w-xs">
							<label className="mb-2 block text-sm font-medium text-slate-700">
								Estado
							</label>

							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
							>
								<option value="all">Todos</option>
								{COMMERCIAL_VISIT_STATUS_OPTIONS.map((status) => (
									<option key={status.id} value={String(status.id)}>
										{status.label}
									</option>
								))}
							</select>
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

				{!loading && !error && filteredVisits.length === 0 ? (
					<section className="glass-card rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
						<h2 className="text-lg font-semibold text-slate-900">
							No hay visitas que mostrar
						</h2>
						<p className="mt-2 text-sm text-slate-600">
							Crea una nueva visita o cambia los filtros actuales.
						</p>
					</section>
				) : null}

				{!loading && !error && filteredVisits.length > 0 ? (
					<section className="grid gap-4 xl:grid-cols-2">
						{filteredVisits.map((visit) => (
							<article
								key={visit.id}
								className="glass-card rounded-3xl border border-white/30 bg-white/75 p-5 shadow-xl backdrop-blur"
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h2 className="text-xl font-bold text-slate-900">
											{visit.client?.name ?? "Cliente"}
										</h2>

										<p className="mt-1 text-sm text-slate-600">
											{visit.client?.contact_name || "Sin persona de contacto"}
										</p>

										<p className="mt-1 text-sm text-slate-500">
											{visit.client?.linkedUser?.email || "-"}
										</p>
									</div>

									<span
										className={`rounded-full px-3 py-1 text-xs font-semibold ${getVisitStatusClasses(
											visit.status_id,
										)}`}
									>
										{getVisitStatusLabel(visit.status_id)}
									</span>
								</div>

								<div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
									<div>
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
											Fecha y hora
										</p>
										<p className="mt-1 font-medium text-slate-900">
											{formatVisitDateTime(visit.scheduled_at)}
										</p>
									</div>

									<div>
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
											Ubicación
										</p>
										<p className="mt-1 font-medium text-slate-900">
											{[visit.client?.city, visit.client?.province]
												.filter(Boolean)
												.join(" · ") || "-"}
										</p>
									</div>

									<div>
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
											Notas
										</p>
										<p className="mt-1 text-slate-700">{visit.notes || "-"}</p>
									</div>
								</div>

								<div className="mt-5">
									<Link
										href={`/commercials/visits/${visit.id}`}
										className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
									>
										Ver detalle
									</Link>
								</div>
							</article>
						))}
					</section>
				) : null}
			</div>
		</PageTransition>
	);
}

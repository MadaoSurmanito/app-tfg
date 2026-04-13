"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PageTransition from "@/app/components/animations/PageTransition";

import {
	type CommercialVisit,
	COMMERCIAL_VISIT_STATUS_OPTIONS,
	formatVisitDateTime,
	getVisitStatusClasses,
	getVisitStatusLabel,
	toDateTimeLocalValue,
} from "./commercial-visit-types";

type Props = {
	visitId: string;
};

type ApiErrorResponse = {
	error?: string;
	code?: string;
};

export default function CommercialVisitDetail({ visitId }: Props) {
	const [visit, setVisit] = useState<CommercialVisit | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [scheduledAt, setScheduledAt] = useState("");
	const [statusId, setStatusId] = useState("");
	const [notes, setNotes] = useState("");
	const [result, setResult] = useState("");

	async function loadVisit() {
		try {
			setLoading(true);
			setError("");

			const response = await fetch(`/api/commercial/visits/${visitId}`, {
				method: "GET",
				cache: "no-store",
			});

			const data = (await response.json()) as
				| CommercialVisit
				| ApiErrorResponse;

			if (!response.ok) {
				throw new Error(
					"error" in data && data.error
						? data.error
						: "No se pudo obtener la visita",
				);
			}

			const visitData = data as CommercialVisit;

			setVisit(visitData);
			setScheduledAt(toDateTimeLocalValue(visitData.scheduled_at));
			setStatusId(String(visitData.status_id));
			setNotes(visitData.notes ?? "");
			setResult(visitData.result ?? "");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Error al cargar la visita",
			);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		void loadVisit();
	}, [visitId]);

	const canEditSchedule = useMemo(() => visit?.status_id === 1, [visit]);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		try {
			setSaving(true);
			setSuccess("");
			setError("");

			const response = await fetch(`/api/commercial/visits/${visitId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					scheduledAt,
					statusId: Number(statusId),
					notes,
					result,
				}),
			});

			const data = (await response.json()) as
				| CommercialVisit
				| ApiErrorResponse;

			if (!response.ok) {
				throw new Error(
					"error" in data && data.error
						? data.error
						: "No se pudo actualizar la visita",
				);
			}

			const visitData = data as CommercialVisit;

			setVisit(visitData);
			setScheduledAt(toDateTimeLocalValue(visitData.scheduled_at));
			setStatusId(String(visitData.status_id));
			setNotes(visitData.notes ?? "");
			setResult(visitData.result ?? "");
			setSuccess("Visita actualizada correctamente.");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Error al actualizar la visita",
			);
		} finally {
			setSaving(false);
		}
	}

	return (
		<PageTransition>
			<div className="space-y-6">
				<div className="flex flex-wrap items-center gap-3">
					<Link
						href="/commercials/visits"
						className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
					>
						← Volver a visitas
					</Link>
				</div>

				{loading ? (
					<section className="glass-card rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
						<p className="text-sm text-slate-600">Cargando visita...</p>
					</section>
				) : null}

				{!loading && error ? (
					<section className="glass-card rounded-3xl border border-red-200 bg-red-50/80 p-6 shadow-xl backdrop-blur">
						<h2 className="text-xl font-bold text-red-700">
							No se pudo cargar la visita
						</h2>
						<p className="mt-2 text-sm text-red-600">{error}</p>
					</section>
				) : null}

				{!loading && !error && visit ? (
					<>
						<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
										M2 · Visita comercial
									</p>

									<h1 className="mt-2 text-3xl font-bold text-slate-900">
										{visit.client?.name ?? "Cliente"}
									</h1>

									<p className="mt-2 text-sm text-slate-600">
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

							<div className="mt-5 grid gap-4 md:grid-cols-2">
								<div>
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Fecha actual
									</p>
									<p className="mt-1 text-sm font-medium text-slate-900">
										{formatVisitDateTime(visit.scheduled_at)}
									</p>
								</div>

								<div>
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Ubicación
									</p>
									<p className="mt-1 text-sm font-medium text-slate-900">
										{[visit.client?.city, visit.client?.province]
											.filter(Boolean)
											.join(" · ") || "-"}
									</p>
								</div>
							</div>
						</section>

						<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
							<h2 className="text-xl font-bold text-slate-900">
								Actualizar visita
							</h2>

							<form
								onSubmit={handleSubmit}
								className="mt-5 grid gap-4 md:grid-cols-2"
							>
								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700">
										Fecha y hora
									</label>

									<input
										type="datetime-local"
										value={scheduledAt}
										onChange={(e) => setScheduledAt(e.target.value)}
										disabled={!canEditSchedule}
										className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700">
										Estado
									</label>

									<select
										value={statusId}
										onChange={(e) => setStatusId(e.target.value)}
										className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
									>
										{COMMERCIAL_VISIT_STATUS_OPTIONS.map((status) => (
											<option key={status.id} value={String(status.id)}>
												{status.label}
											</option>
										))}
									</select>
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
									/>
								</div>

								<div className="md:col-span-2">
									<label className="mb-2 block text-sm font-medium text-slate-700">
										Resultado
									</label>

									<textarea
										value={result}
										onChange={(e) => setResult(e.target.value)}
										rows={4}
										className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
										placeholder="Conclusiones de la visita, acuerdos alcanzados, próximos pasos..."
									/>
								</div>

								<div className="md:col-span-2 flex flex-wrap items-center gap-3">
									<button
										type="submit"
										disabled={saving}
										className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{saving ? "Guardando..." : "Guardar cambios"}
									</button>

									{success ? (
										<p className="text-sm font-medium text-emerald-700">
											{success}
										</p>
									) : null}
								</div>
							</form>
						</section>
					</>
				) : null}
			</div>
		</PageTransition>
	);
}

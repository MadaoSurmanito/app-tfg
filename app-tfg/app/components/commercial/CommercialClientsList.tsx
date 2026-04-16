"use client";

import { useEffect, useMemo, useState } from "react";

import PageTransition from "@/app/components/animations/PageTransition";
import EntityTable from "@/app/components/entity-table/EntityTable";

import type { CommercialClient } from "./commercial-client-types";
import { mapCommercialClientsToEntityTableItems } from "./commercial-client-table-mappers";

type ApiErrorResponse = {
	error?: string;
	code?: string;
};

export default function CommercialClientsList() {
	const [clients, setClients] = useState<CommercialClient[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		async function loadClients() {
			try {
				setLoading(true);
				setError("");

				const response = await fetch("/api/commercial/clients", {
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

				if (isMounted) {
					setClients(Array.isArray(data) ? data : []);
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error ? err.message : "Error al cargar los clientes",
					);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadClients();

		return () => {
			isMounted = false;
		};
	}, []);

	const tableItems = useMemo(
		() => mapCommercialClientsToEntityTableItems(clients),
		[clients],
	);

	return (
		<PageTransition>
			<div className="space-y-6">
				<section className="glass-card rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
								M2 · Gestión comercial
							</p>

							<h2 className="text-3xl font-bold text-slate-900">
								Mis clientes
							</h2>

							<p className="mt-2 max-w-3xl text-sm text-slate-600">
								Aquí tienes la cartera activa asignada a tu perfil comercial.
								Puedes filtrar, buscar y abrir la ficha de cada cliente
								profesional.
							</p>
						</div>

						<div className="flex flex-wrap gap-3 text-sm text-slate-600">
							<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
								<span className="font-semibold text-slate-900">
									{clients.length}
								</span>{" "}
								clientes asignados
							</div>
						</div>
					</div>
				</section>

				{loading ? (
					<section className="glass-card rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
						<div className="space-y-3">
							<div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
							<div className="h-4 w-full animate-pulse rounded bg-slate-100" />
							<div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
						</div>
					</section>
				) : null}

				{!loading && error ? (
					<section className="glass-card rounded-3xl border border-red-200 bg-red-50/80 p-6 shadow-xl backdrop-blur">
						<h3 className="text-lg font-semibold text-red-700">
							No se pudieron cargar los clientes
						</h3>
						<p className="mt-2 text-sm text-red-600">{error}</p>
					</section>
				) : null}

				{!loading && !error ? (
					<EntityTable
						items={tableItems}
						config={{
							categoryLabel: "Provincia",
							statusLabel: "Asignación",
							showImageFilter: true,
							emptyMessage:
								"No hay clientes que coincidan con los filtros actuales.",
						}}
					/>
				) : null}
			</div>
		</PageTransition>
	);
}

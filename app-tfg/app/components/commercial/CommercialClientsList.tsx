"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import PageTransition from "@/app/components/animations/PageTransition";
import UserAvatar from "@/app/components/users/UserAvatar";
import { formatDateShort, normalizeValue } from "@/lib/utils/user-utils";

import {
	type CommercialClient,
	getActiveAssignment,
	getClientLocation,
	getCommercialDisplayName,
} from "./commercial-client-types";

type ApiErrorResponse = {
	error?: string;
	code?: string;
};

export default function CommercialClientsList() {
	const [clients, setClients] = useState<CommercialClient[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");

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

	const filteredClients = useMemo(() => {
		const normalizedSearch = normalizeValue(search).trim();

		if (!normalizedSearch) {
			return clients;
		}

		return clients.filter((client) => {
			const activeAssignment = getActiveAssignment(client);

			const haystack = [
				client.name,
				client.contact_name,
				client.tax_id,
				client.address,
				client.city,
				client.postal_code,
				client.province,
				client.notes,
				client.linkedUser?.name,
				client.linkedUser?.email,
				client.linkedUser?.phone,
				activeAssignment?.commercial?.user?.name,
				activeAssignment?.commercial?.employee_code,
				activeAssignment?.commercial?.territory,
			]
				.map((value) => normalizeValue(value))
				.join(" ");

			return haystack.includes(normalizedSearch);
		});
	}, [clients, search]);

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
								Puedes buscar rápidamente por cliente, contacto, ubicación o
								datos del salón.
							</p>
						</div>

						<div className="w-full lg:max-w-md">
							<label
								htmlFor="commercial-client-search"
								className="mb-2 block text-sm font-medium text-slate-700"
							>
								Buscar cliente
							</label>

							<input
								id="commercial-client-search"
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Nombre, contacto, ciudad, correo..."
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
							/>
						</div>
					</div>

					<div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{clients.length}
							</span>{" "}
							clientes asignados
						</div>

						<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
							<span className="font-semibold text-slate-900">
								{filteredClients.length}
							</span>{" "}
							resultados visibles
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

				{!loading && !error && filteredClients.length === 0 ? (
					<section className="glass-card rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
						<h3 className="text-lg font-semibold text-slate-900">
							No hay clientes que coincidan
						</h3>
						<p className="mt-2 text-sm text-slate-600">
							Prueba con otro término de búsqueda o revisa si todavía no tienes
							clientes activos asignados.
						</p>
					</section>
				) : null}

				{!loading && !error && filteredClients.length > 0 ? (
					<section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
						{filteredClients.map((client) => {
							const activeAssignment = getActiveAssignment(client);

							return (
								<article
									key={client.id}
									className="glass-card flex h-full flex-col rounded-3xl border border-white/30 bg-white/75 p-5 shadow-xl backdrop-blur"
								>
									<div className="flex items-start gap-4">
										<UserAvatar
											name={client.linkedUser?.name ?? client.name}
											imageUrl={client.linkedUser?.profile_image_url ?? null}
											size="lg"
										/>

										<div className="min-w-0 flex-1">
											<h3 className="truncate text-xl font-bold text-slate-900">
												{client.name}
											</h3>

											<p className="mt-1 text-sm text-slate-600">
												{client.contact_name || "Sin persona de contacto"}
											</p>

											<p className="mt-1 text-sm text-slate-500">
												{client.linkedUser?.email || "Sin correo vinculado"}
											</p>
										</div>
									</div>

									<div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-700">
										<div>
											<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
												Ubicación
											</p>
											<p className="mt-1 font-medium text-slate-900">
												{getClientLocation(client)}
											</p>
										</div>

										<div>
											<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
												Teléfono
											</p>
											<p className="mt-1 font-medium text-slate-900">
												{client.linkedUser?.phone || "-"}
											</p>
										</div>

										<div>
											<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
												Comercial responsable
											</p>
											<p className="mt-1 font-medium text-slate-900">
												{getCommercialDisplayName(client)}
											</p>
										</div>

										<div>
											<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
												Asignado desde
											</p>
											<p className="mt-1 font-medium text-slate-900">
												{formatDateShort(activeAssignment?.assigned_at ?? null)}
											</p>
										</div>
									</div>

									<div className="mt-4 flex flex-wrap gap-2">
										{client.tax_id ? (
											<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
												{client.tax_id}
											</span>
										) : null}

										{activeAssignment?.commercial?.territory ? (
											<span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
												{activeAssignment.commercial.territory}
											</span>
										) : null}
									</div>

									<div className="mt-6">
										<Link
											href={`/commercials/clients/${client.id}`}
											className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
										>
											Ver ficha
										</Link>
									</div>
								</article>
							);
						})}
					</section>
				) : null}
			</div>
		</PageTransition>
	);
}

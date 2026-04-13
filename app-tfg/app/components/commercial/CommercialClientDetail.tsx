"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import PageTransition from "@/app/components/animations/PageTransition";
import UserAvatar from "@/app/components/users/UserAvatar";
import { formatDate, formatDateShort } from "@/lib/utils/user-utils";

import {
	type CommercialClient,
	getActiveAssignment,
	getClientLocation,
} from "./commercial-client-types";

type Props = {
	clientId: string;
};

type ApiErrorResponse = {
	error?: string;
	code?: string;
};

function InfoItem({
	label,
	value,
}: {
	label: string;
	value: string | null | undefined;
}) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</p>
			<p className="mt-1 text-sm font-medium text-slate-900">
				{value && String(value).trim() ? value : "-"}
			</p>
		</div>
	);
}

export default function CommercialClientDetail({ clientId }: Props) {
	const [client, setClient] = useState<CommercialClient | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		async function loadClient() {
			try {
				setLoading(true);
				setError("");

				const response = await fetch(`/api/commercial/clients/${clientId}`, {
					method: "GET",
					cache: "no-store",
				});

				const data = (await response.json()) as
					| CommercialClient
					| ApiErrorResponse;

				if (!response.ok) {
					throw new Error(
						"error" in data && data.error
							? data.error
							: "No se pudo obtener el cliente",
					);
				}

				if (isMounted) {
					setClient(data as CommercialClient);
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error ? err.message : "Error al cargar el cliente",
					);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadClient();

		return () => {
			isMounted = false;
		};
	}, [clientId]);

	const activeAssignment = client ? getActiveAssignment(client) : null;

	return (
		<PageTransition>
			<div className="space-y-6">
				<div className="flex flex-wrap items-center gap-3">
					<Link
						href="/commercials/clients"
						className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
					>
						← Volver a clientes
					</Link>
				</div>

				{loading ? (
					<section className="glass-card rounded-3xl border border-white/30 bg-white/70 p-6 shadow-xl backdrop-blur">
						<div className="space-y-3">
							<div className="h-6 w-56 animate-pulse rounded bg-slate-200" />
							<div className="h-4 w-full animate-pulse rounded bg-slate-100" />
							<div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
						</div>
					</section>
				) : null}

				{!loading && error ? (
					<section className="glass-card rounded-3xl border border-red-200 bg-red-50/80 p-6 shadow-xl backdrop-blur">
						<h2 className="text-xl font-bold text-red-700">
							No se pudo cargar la ficha
						</h2>
						<p className="mt-2 text-sm text-red-600">{error}</p>
					</section>
				) : null}

				{!loading && !error && client ? (
					<>
						<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
							<div className="flex flex-col gap-5 lg:flex-row lg:items-start">
								<UserAvatar
									name={client.linkedUser?.name ?? client.name}
									imageUrl={client.linkedUser?.profile_image_url ?? null}
									size="xl"
								/>

								<div className="min-w-0 flex-1">
									<p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
										M2 · Cliente asignado
									</p>

									<h1 className="mt-2 text-3xl font-bold text-slate-900">
										{client.name}
									</h1>

									<p className="mt-2 text-sm text-slate-600">
										{client.contact_name ||
											"Sin persona de contacto registrada"}
									</p>

									<p className="mt-2 text-sm text-slate-500">
										{client.linkedUser?.email || "Sin correo vinculado"}
									</p>

									<div className="mt-4 flex flex-wrap gap-2">
										<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
											{getClientLocation(client)}
										</span>

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
								</div>
							</div>
						</section>

						<section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
							<div className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
								<h2 className="text-xl font-bold text-slate-900">
									Datos del cliente profesional
								</h2>

								<div className="mt-5 grid gap-5 md:grid-cols-2">
									<InfoItem
										label="Nombre del establecimiento"
										value={client.name}
									/>
									<InfoItem
										label="Persona de contacto"
										value={client.contact_name}
									/>
									<InfoItem
										label="Identificador fiscal"
										value={client.tax_id}
									/>
									<InfoItem
										label="Correo vinculado"
										value={client.linkedUser?.email}
									/>
									<InfoItem label="Teléfono" value={client.linkedUser?.phone} />
									<InfoItem
										label="Empresa"
										value={client.linkedUser?.company}
									/>
									<InfoItem label="Dirección" value={client.address} />
									<InfoItem label="Ciudad" value={client.city} />
									<InfoItem label="Código postal" value={client.postal_code} />
									<InfoItem label="Provincia" value={client.province} />
									<InfoItem
										label="Fecha de alta"
										value={formatDate(client.created_at)}
									/>
									<InfoItem
										label="Última actualización"
										value={formatDate(client.updated_at)}
									/>
								</div>

								<div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4">
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Notas internas
									</p>
									<p className="mt-2 text-sm text-slate-700">
										{client.notes || "-"}
									</p>
								</div>
							</div>

							<div className="space-y-6">
								<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
									<h2 className="text-xl font-bold text-slate-900">
										Asignación comercial activa
									</h2>

									<div className="mt-5 grid gap-4">
										<InfoItem
											label="Comercial responsable"
											value={activeAssignment?.commercial?.user?.name ?? "-"}
										/>
										<InfoItem
											label="Correo del comercial"
											value={activeAssignment?.commercial?.user?.email ?? "-"}
										/>
										<InfoItem
											label="Teléfono del comercial"
											value={activeAssignment?.commercial?.user?.phone ?? "-"}
										/>
										<InfoItem
											label="Código interno"
											value={activeAssignment?.commercial?.employee_code ?? "-"}
										/>
										<InfoItem
											label="Territorio"
											value={activeAssignment?.commercial?.territory ?? "-"}
										/>
										<InfoItem
											label="Asignado desde"
											value={formatDateShort(
												activeAssignment?.assigned_at ?? null,
											)}
										/>
									</div>
								</section>

								<section className="glass-card rounded-3xl border border-white/30 bg-white/75 p-6 shadow-xl backdrop-blur">
									<h2 className="text-xl font-bold text-slate-900">
										Cuenta vinculada
									</h2>

									<div className="mt-5 grid gap-4">
										<InfoItem label="Nombre" value={client.linkedUser?.name} />
										<InfoItem label="Correo" value={client.linkedUser?.email} />
										<InfoItem
											label="Teléfono"
											value={client.linkedUser?.phone}
										/>
										<InfoItem
											label="Empresa"
											value={client.linkedUser?.company}
										/>
									</div>
								</section>
							</div>
						</section>
					</>
				) : null}
			</div>
		</PageTransition>
	);
}

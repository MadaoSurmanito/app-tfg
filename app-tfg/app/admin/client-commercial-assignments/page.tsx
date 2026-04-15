"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PageTransition from "@/app/components/animations/PageTransition";

// --------------------------------------------------------------------------
// Tipos de datos
// --------------------------------------------------------------------------

type ClientItem = {
	id: string;
	name: string;
	contact_name?: string | null;
	address?: string | null;
	city?: string | null;
	province?: string | null;
	postal_code?: string | null;
	notes?: string | null;
	user?: {
		id: string;
		name?: string | null;
		email?: string | null;
	} | null;
};

type CommercialItem = {
	id: string;
	employee_code?: string | null;
	territory?: string | null;
	notes?: string | null;
	user?: {
		id: string;
		name?: string | null;
		email?: string | null;
	} | null;
};

type AssignmentItem = {
	id: string;
	client_id: string;
	commercial_id: string;
	assigned_at: string;
	unassigned_at?: string | null;
	notes?: string | null;
	client?: ClientItem | null;
	commercial?: CommercialItem | null;
};

type ApiError = {
	error?: string;
	code?: string;
};

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

async function readJsonOrThrow<T>(response: Response): Promise<T> {
	const data = (await response.json().catch(() => null)) as T | ApiError | null;

	if (!response.ok) {
		const errorMessage =
			data && typeof data === "object" && "error" in data && data.error
				? data.error
				: "Error inesperado";
		throw new Error(errorMessage);
	}

	return data as T;
}

function formatDateTime(value?: string | null) {
	if (!value) return "—";

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return value;

	return date.toLocaleString("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

function getCommercialLabel(commercial: CommercialItem) {
	const name = commercial.user?.name?.trim() || "Comercial sin nombre";
	const email = commercial.user?.email?.trim();
	const territory = commercial.territory?.trim();
	const employeeCode = commercial.employee_code?.trim();

	const parts = [name];

	if (employeeCode) parts.push(`Cod: ${employeeCode}`);
	if (territory) parts.push(`Zona: ${territory}`);
	if (email) parts.push(email);

	return parts.join(" · ");
}

function getClientLabel(client: ClientItem) {
	const parts = [client.name];

	if (client.city?.trim()) parts.push(client.city.trim());
	if (client.province?.trim()) parts.push(client.province.trim());

	return parts.join(" · ");
}

// --------------------------------------------------------------------------
// Página
// --------------------------------------------------------------------------

export default function AdminClientCommercialAssignmentsPage() {
	const [clients, setClients] = useState<ClientItem[]>([]);
	const [commercials, setCommercials] = useState<CommercialItem[]>([]);
	const [selectedClientId, setSelectedClientId] = useState("");
	const [selectedCommercialId, setSelectedCommercialId] = useState("");
	const [currentAssignment, setCurrentAssignment] =
		useState<AssignmentItem | null>(null);
	const [clientSearch, setClientSearch] = useState("");
	const [commercialSearch, setCommercialSearch] = useState("");
	const [notes, setNotes] = useState("");
	const [loadingBaseData, setLoadingBaseData] = useState(true);
	const [loadingAssignment, setLoadingAssignment] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const filteredClients = useMemo(() => {
		const term = clientSearch.trim().toLowerCase();

		if (!term) return clients;

		return clients.filter((client) =>
			[
				client.name,
				client.contact_name,
				client.city,
				client.province,
				client.user?.email,
				client.user?.name,
			]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(term)),
		);
	}, [clients, clientSearch]);

	const filteredCommercials = useMemo(() => {
		const term = commercialSearch.trim().toLowerCase();

		if (!term) return commercials;

		return commercials.filter((commercial) =>
			[
				commercial.user?.name,
				commercial.user?.email,
				commercial.employee_code,
				commercial.territory,
			]
				.filter(Boolean)
				.some((value) => String(value).toLowerCase().includes(term)),
		);
	}, [commercials, commercialSearch]);

	const selectedClient =
		clients.find((client) => client.id === selectedClientId) ?? null;

	const selectedCommercial =
		commercials.find((commercial) => commercial.id === selectedCommercialId) ??
		null;

	const currentCommercialId = currentAssignment?.commercial_id ?? "";
	const hasCurrentAssignment = !!currentAssignment;
	const sameCommercialSelected = Boolean(
		hasCurrentAssignment &&
		selectedCommercialId !== "" &&
		selectedCommercialId === currentCommercialId,
	);

	useEffect(() => {
		let ignore = false;

		async function loadBaseData() {
			try {
				setLoadingBaseData(true);
				setError("");

				const [clientsResponse, commercialsResponse] = await Promise.all([
					fetch("/api/admin/clients", { cache: "no-store" }),
					fetch("/api/admin/commercials", { cache: "no-store" }),
				]);

				const [clientsData, commercialsData] = await Promise.all([
					readJsonOrThrow<ClientItem[]>(clientsResponse),
					readJsonOrThrow<CommercialItem[]>(commercialsResponse),
				]);

				if (ignore) return;

				setClients(Array.isArray(clientsData) ? clientsData : []);
				setCommercials(Array.isArray(commercialsData) ? commercialsData : []);

				if (!selectedClientId && clientsData.length > 0) {
					setSelectedClientId(clientsData[0].id);
				}
			} catch (err) {
				if (ignore) return;
				setError(err instanceof Error ? err.message : "Error al cargar datos");
			} finally {
				if (!ignore) {
					setLoadingBaseData(false);
				}
			}
		}

		loadBaseData();

		return () => {
			ignore = true;
		};
	}, [selectedClientId]);

	useEffect(() => {
		let ignore = false;

		async function loadCurrentAssignment() {
			if (!selectedClientId) {
				setCurrentAssignment(null);
				setSelectedCommercialId("");
				setNotes("");
				return;
			}

			try {
				setLoadingAssignment(true);
				setError("");
				setSuccess("");

				const response = await fetch(
					`/api/admin/client-commercial-assignments?clientId=${selectedClientId}`,
					{ cache: "no-store" },
				);

				const data = await readJsonOrThrow<AssignmentItem | null>(response);

				if (ignore) return;

				setCurrentAssignment(data ?? null);
				setSelectedCommercialId(data?.commercial_id ?? "");
				setNotes(data?.notes ?? "");
			} catch (err) {
				if (ignore) return;
				setError(
					err instanceof Error
						? err.message
						: "Error al cargar la asignación actual",
				);
				setCurrentAssignment(null);
				setSelectedCommercialId("");
			} finally {
				if (!ignore) {
					setLoadingAssignment(false);
				}
			}
		}

		loadCurrentAssignment();

		return () => {
			ignore = true;
		};
	}, [selectedClientId]);

	async function handleAssignOrReassign() {
		if (!selectedClientId) {
			setError("Debes seleccionar un cliente");
			return;
		}

		if (!selectedCommercialId) {
			setError("Debes seleccionar un comercial");
			return;
		}

		if (sameCommercialSelected) {
			setError("Ese comercial ya es el responsable actual de la cartera");
			return;
		}

		try {
			setSubmitting(true);
			setError("");
			setSuccess("");

			const mode = hasCurrentAssignment ? "reassign" : "assign";

			const response = await fetch("/api/admin/client-commercial-assignments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					mode,
					clientId: selectedClientId,
					commercialId: selectedCommercialId,
					notes: notes.trim() || null,
				}),
			});

			const data = await readJsonOrThrow<AssignmentItem>(response);

			setCurrentAssignment(data);
			setSelectedCommercialId(data.commercial_id);
			setNotes(data.notes ?? "");
			setSuccess(
				mode === "assign"
					? "Cartera principal asignada correctamente"
					: "Cartera principal reasignada correctamente",
			);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "No se pudo guardar la asignación",
			);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleUnassign() {
		if (!selectedClientId) {
			setError("Debes seleccionar un cliente");
			return;
		}

		if (!currentAssignment) {
			setError("El cliente no tiene una asignación activa");
			return;
		}

		try {
			setSubmitting(true);
			setError("");
			setSuccess("");

			await readJsonOrThrow<AssignmentItem>(
				await fetch("/api/admin/client-commercial-assignments", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						mode: "unassign",
						clientId: selectedClientId,
						notes: notes.trim() || null,
					}),
				}),
			);

			setCurrentAssignment(null);
			setSelectedCommercialId("");
			setSuccess("Asignación principal eliminada correctamente");
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "No se pudo eliminar la asignación",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<PageTransition>
			<div className="space-y-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-bold">
							Asignaciones cliente-comercial
						</h1>
						<p className="text-sm text-white/70">
							Aquí defines el comercial responsable principal de la cartera del
							cliente. Esto no bloquea que otros comerciales puedan atenderlo.
						</p>
					</div>

					<Link
						href="/admin"
						className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
					>
						Volver al panel admin
					</Link>
				</div>

				{error ? (
					<div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
						{error}
					</div>
				) : null}

				{success ? (
					<div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
						{success}
					</div>
				) : null}

				<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
					<section className="glass-card rounded-2xl border border-white/10 p-4">
						<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold">Clientes</h2>
								<p className="text-sm text-white/60">
									Selecciona un cliente para ver o cambiar su responsable
									principal.
								</p>
							</div>

							<input
								type="text"
								value={clientSearch}
								onChange={(event) => setClientSearch(event.target.value)}
								placeholder="Buscar cliente..."
								className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-white/35 sm:max-w-xs"
							/>
						</div>

						<div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
							{loadingBaseData ? (
								<div className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-white/60">
									Cargando clientes...
								</div>
							) : filteredClients.length === 0 ? (
								<div className="rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-white/60">
									No hay clientes que coincidan con la búsqueda.
								</div>
							) : (
								filteredClients.map((client) => {
									const isSelected = client.id === selectedClientId;

									return (
										<button
											key={client.id}
											type="button"
											onClick={() => setSelectedClientId(client.id)}
											className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
												isSelected
													? "border-cyan-400/40 bg-cyan-400/10"
													: "border-white/10 bg-black/10 hover:bg-white/5"
											}`}
										>
											<div className="font-medium">{client.name}</div>
											<div className="mt-1 text-sm text-white/65">
												{getClientLabel(client)}
											</div>
											{client.contact_name ? (
												<div className="mt-1 text-xs text-white/45">
													Contacto: {client.contact_name}
												</div>
											) : null}
										</button>
									);
								})
							)}
						</div>
					</section>

					<section className="glass-card rounded-2xl border border-white/10 p-4">
						<div className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">Responsable principal</h2>
								<p className="text-sm text-white/60">
									Usa esta asignación para cartera, organización y futuras
									rutas.
								</p>
							</div>

							{selectedClient ? (
								<div className="rounded-2xl border border-white/10 bg-black/10 p-4">
									<div className="text-sm text-white/50">
										Cliente seleccionado
									</div>
									<div className="mt-1 text-base font-semibold">
										{selectedClient.name}
									</div>
									<div className="mt-2 text-sm text-white/65">
										{selectedClient.address || "Dirección sin definir"}
										{selectedClient.city ? ` · ${selectedClient.city}` : ""}
										{selectedClient.province
											? ` · ${selectedClient.province}`
											: ""}
									</div>
								</div>
							) : (
								<div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-white/60">
									Selecciona un cliente para continuar.
								</div>
							)}

							<div className="rounded-2xl border border-white/10 bg-black/10 p-4">
								<div className="text-sm text-white/50">Asignación actual</div>

								{loadingAssignment ? (
									<div className="mt-2 text-sm text-white/60">
										Cargando asignación actual...
									</div>
								) : currentAssignment ? (
									<div className="mt-2 space-y-2">
										<div className="font-medium">
											{currentAssignment.commercial?.user?.name ||
												"Comercial sin nombre"}
										</div>
										<div className="text-sm text-white/65">
											{currentAssignment.commercial?.user?.email || "Sin email"}
										</div>
										<div className="text-sm text-white/65">
											Asignado el{" "}
											{formatDateTime(currentAssignment.assigned_at)}
										</div>
										{currentAssignment.notes ? (
											<div className="text-sm text-white/55">
												Notas: {currentAssignment.notes}
											</div>
										) : null}
									</div>
								) : (
									<div className="mt-2 text-sm text-white/60">
										Este cliente no tiene responsable principal activo.
									</div>
								)}
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium">
									Seleccionar comercial
								</label>

								<input
									type="text"
									value={commercialSearch}
									onChange={(event) => setCommercialSearch(event.target.value)}
									placeholder="Buscar comercial..."
									className="mb-3 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-white/35"
								/>

								<select
									value={selectedCommercialId}
									onChange={(event) =>
										setSelectedCommercialId(event.target.value)
									}
									className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
								>
									<option value="">Selecciona un comercial</option>
									{filteredCommercials.map((commercial) => (
										<option key={commercial.id} value={commercial.id}>
											{getCommercialLabel(commercial)}
										</option>
									))}
								</select>

								{selectedCommercial ? (
									<div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-white/70">
										<div>
											<strong>Comercial:</strong>{" "}
											{selectedCommercial.user?.name || "Sin nombre"}
										</div>
										<div>
											<strong>Email:</strong>{" "}
											{selectedCommercial.user?.email || "Sin email"}
										</div>
										<div>
											<strong>Territorio:</strong>{" "}
											{selectedCommercial.territory || "No definido"}
										</div>
										<div>
											<strong>Código:</strong>{" "}
											{selectedCommercial.employee_code || "No definido"}
										</div>
									</div>
								) : null}
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium">
									Notas de la asignación
								</label>
								<textarea
									value={notes}
									onChange={(event) => setNotes(event.target.value)}
									rows={4}
									placeholder="Notas internas sobre la cartera, responsable habitual, zona, contexto, etc."
									className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none placeholder:text-white/35"
								/>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
								<button
									type="button"
									onClick={handleAssignOrReassign}
									disabled={Boolean(
										submitting ||
										!selectedClientId ||
										!selectedCommercialId ||
										sameCommercialSelected,
									)}
									className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
								></button>

								<button
									type="button"
									onClick={handleUnassign}
									disabled={submitting || !currentAssignment}
									className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Quitar asignación actual
								</button>
							</div>

							<p className="text-xs text-white/45">
								Esta relación sirve para cartera y organización interna. No
								implica que otros comerciales no puedan atender puntualmente al
								cliente.
							</p>
						</div>
					</section>
				</div>
			</div>
		</PageTransition>
	);
}

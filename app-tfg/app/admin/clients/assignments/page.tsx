"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
	const searchParams = useSearchParams();

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

	const initialClientId = searchParams.get("clientId") ?? "";

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

				const safeClients = Array.isArray(clientsData) ? clientsData : [];
				const safeCommercials = Array.isArray(commercialsData)
					? commercialsData
					: [];

				setClients(safeClients);
				setCommercials(safeCommercials);

				if (!selectedClientId && safeClients.length > 0) {
					const requestedClientExists = safeClients.some(
						(client) => client.id === initialClientId,
					);

					setSelectedClientId(
						requestedClientExists ? initialClientId : safeClients[0].id,
					);
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

		void loadBaseData();

		return () => {
			ignore = true;
		};
	}, [selectedClientId, initialClientId]);

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

		void loadCurrentAssignment();

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
			setError("Ese comercial ya está asignado actualmente a este cliente");
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
					? "Comercial asignado correctamente"
					: "Comercial reasignado correctamente",
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
			setSuccess("Asignación eliminada correctamente");
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
				<div className="flex flex-wrap gap-3 text-sm text-slate-600">
					<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
						<span className="font-semibold text-slate-900">
							{clients.length}
						</span>{" "}
						clientes totales
					</div>

					<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
						<span className="font-semibold text-slate-900">
							{commercials.length}
						</span>{" "}
						comerciales disponibles
					</div>

					<div className="rounded-full border border-slate-200 bg-white px-4 py-2">
						<span className="font-semibold text-slate-900">
							{filteredClients.length}
						</span>{" "}
						clientes visibles
					</div>
				</div>

				{error ? (
					<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{error}
					</div>
				) : null}

				{success ? (
					<div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
						{success}
					</div>
				) : null}

				<div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
					<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h2 className="text-lg font-semibold text-slate-900">
									Clientes
								</h2>
								<p className="mt-1 text-sm text-slate-600">
									Selecciona un cliente para ver o cambiar su comercial
									asignado.
								</p>
							</div>

							<input
								type="text"
								value={clientSearch}
								onChange={(event) => setClientSearch(event.target.value)}
								placeholder="Buscar cliente..."
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:max-w-xs"
							/>
						</div>

						<div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
							{loadingBaseData ? (
								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
									Cargando clientes...
								</div>
							) : filteredClients.length === 0 ? (
								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
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
											className={`w-full rounded-2xl border p-4 text-left transition ${
												isSelected
													? "border-cyan-300 bg-cyan-50 shadow-sm"
													: "border-slate-200 bg-white hover:bg-slate-50"
											}`}
										>
											<div className="flex items-start justify-between gap-3">
												<div className="min-w-0">
													<div className="truncate text-base font-semibold text-slate-900">
														{client.name}
													</div>
													<div className="mt-1 text-sm text-slate-500">
														{getClientLabel(client)}
													</div>
												</div>

												{isSelected ? (
													<span className="rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">
														Seleccionado
													</span>
												) : null}
											</div>

											<div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
												<div>
													<strong className="font-medium text-slate-900">
														Contacto:
													</strong>{" "}
													{client.contact_name || "-"}
												</div>
												<div>
													<strong className="font-medium text-slate-900">
														Correo:
													</strong>{" "}
													{client.user?.email || "-"}
												</div>
											</div>
										</button>
									);
								})
							)}
						</div>
					</section>

					<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="space-y-5">
							<div>
								<h2 className="text-lg font-semibold text-slate-900">
									Comercial asignado
								</h2>
								<p className="mt-1 text-sm text-slate-600">
									Esta asignación define la cartera del comercial y la base para
									sus visitas y futuras rutas.
								</p>
							</div>

							{selectedClient ? (
								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
									<div className="text-xs font-medium uppercase tracking-wide text-slate-500">
										Cliente seleccionado
									</div>
									<div className="mt-2 text-lg font-semibold text-slate-900">
										{selectedClient.name}
									</div>
									<div className="mt-2 text-sm text-slate-600">
										{selectedClient.address || "Dirección sin definir"}
										{selectedClient.city ? ` · ${selectedClient.city}` : ""}
										{selectedClient.province
											? ` · ${selectedClient.province}`
											: ""}
									</div>
									<div className="mt-2 text-sm text-slate-600">
										<strong className="font-medium text-slate-900">
											Contacto:
										</strong>{" "}
										{selectedClient.contact_name || "-"}
									</div>
								</div>
							) : (
								<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
									Selecciona un cliente para continuar.
								</div>
							)}

							<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<div className="text-xs font-medium uppercase tracking-wide text-slate-500">
									Comercial actualmente asignado
								</div>

								{loadingAssignment ? (
									<div className="mt-3 text-sm text-slate-600">
										Cargando asignación actual...
									</div>
								) : currentAssignment ? (
									<div className="mt-3 space-y-2">
										<div className="text-base font-semibold text-slate-900">
											{currentAssignment.commercial?.user?.name ||
												"Comercial sin nombre"}
										</div>
										<div className="text-sm text-slate-600">
											{currentAssignment.commercial?.user?.email || "Sin email"}
										</div>
										<div className="text-sm text-slate-600">
											<strong className="font-medium text-slate-900">
												Asignado el:
											</strong>{" "}
											{formatDateTime(currentAssignment.assigned_at)}
										</div>
										<div className="text-sm text-slate-600">
											<strong className="font-medium text-slate-900">
												Notas:
											</strong>{" "}
											{currentAssignment.notes || "-"}
										</div>
									</div>
								) : (
									<div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
										Este cliente no tiene comercial asignado actualmente.
									</div>
								)}
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-900">
									Buscar comercial
								</label>

								<input
									type="text"
									value={commercialSearch}
									onChange={(event) => setCommercialSearch(event.target.value)}
									placeholder="Buscar comercial..."
									className="mb-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								/>

								<select
									value={selectedCommercialId}
									onChange={(event) =>
										setSelectedCommercialId(event.target.value)
									}
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								>
									<option value="">Selecciona un comercial</option>
									{filteredCommercials.map((commercial) => (
										<option key={commercial.id} value={commercial.id}>
											{getCommercialLabel(commercial)}
										</option>
									))}
								</select>

								{selectedCommercial ? (
									<div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
										<div>
											<strong className="font-medium text-slate-900">
												Comercial:
											</strong>{" "}
											{selectedCommercial.user?.name || "Sin nombre"}
										</div>
										<div className="mt-1">
											<strong className="font-medium text-slate-900">
												Email:
											</strong>{" "}
											{selectedCommercial.user?.email || "Sin email"}
										</div>
										<div className="mt-1">
											<strong className="font-medium text-slate-900">
												Territorio:
											</strong>{" "}
											{selectedCommercial.territory || "No definido"}
										</div>
										<div className="mt-1">
											<strong className="font-medium text-slate-900">
												Código:
											</strong>{" "}
											{selectedCommercial.employee_code || "No definido"}
										</div>
									</div>
								) : null}
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-900">
									Notas de la asignación
								</label>
								<textarea
									value={notes}
									onChange={(event) => setNotes(event.target.value)}
									rows={4}
									placeholder="Notas internas sobre la cartera, responsable habitual, zona, contexto, etc."
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
									className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{submitting
										? "Guardando..."
										: hasCurrentAssignment
											? "Reasignar comercial"
											: "Asignar comercial"}
								</button>

								<button
									type="button"
									onClick={handleUnassign}
									disabled={submitting || !currentAssignment}
									className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Quitar asignación actual
								</button>
							</div>

							<p className="text-xs text-slate-500">
								Esta relación define la cartera activa del comercial y
								condiciona la gestión de clientes, visitas y futuras rutas.
							</p>
						</div>
					</section>
				</div>
			</div>
		</PageTransition>
	);
}

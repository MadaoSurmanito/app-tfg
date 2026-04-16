"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SafeForm from "@/app/components/forms/SafeForm";
import SubmitButton from "@/app/components/forms/SubmitButton";
import {
	fetchAdminCommercialOptions,
	getAdminCommercialLabel,
	type AdminCommercialOption,
} from "@/app/admin/users/_shared/admin-commercial-options";

type Props = {
	solicitudId: string;
	requiresCommercialAssignment: boolean;
};

// Componente cliente que permite aprobar o rechazar una solicitud de registro.
// Gestiona el estado local de carga, validación y errores de ambas acciones.
export default function RequestsActions({
	solicitudId,
	requiresCommercialAssignment,
}: Props) {
	// NAVEGACIÓN
	// Se utiliza para redirigir y refrescar la vista tras completar una acción.
	const router = useRouter();

	// ESTADO LOCAL
	// Controla el motivo de rechazo, las cargas independientes de cada acción
	// y un mensaje común de error.
	const [rejectionReason, setRejectionReason] = useState("");
	const [approveLoading, setApproveLoading] = useState(false);
	const [rejectLoading, setRejectLoading] = useState(false);
	const [loadingCommercials, setLoadingCommercials] = useState(false);
	const [commercials, setCommercials] = useState<AdminCommercialOption[]>([]);
	const [selectedCommercialId, setSelectedCommercialId] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let ignore = false;

		async function loadCommercials() {
			if (!requiresCommercialAssignment) {
				return;
			}

			try {
				setLoadingCommercials(true);

				const data = await fetchAdminCommercialOptions();

				if (!ignore) {
					setCommercials(data);
				}
			} catch (err) {
				if (!ignore) {
					setError(
						err instanceof Error
							? err.message
							: "Error al cargar los comerciales",
					);
				}
			} finally {
				if (!ignore) {
					setLoadingCommercials(false);
				}
			}
		}

		void loadCommercials();

		return () => {
			ignore = true;
		};
	}, [requiresCommercialAssignment]);

	// APROBACIÓN DE SOLICITUD
	// Envía la aprobación a la API y, si se completa correctamente,
	// vuelve al listado general de solicitudes.
	async function handleApprove() {
		try {
			setError(null);
			setApproveLoading(true);

			if (requiresCommercialAssignment && !selectedCommercialId.trim()) {
				throw new Error(
					"Debes seleccionar el comercial asignado antes de aprobar la solicitud",
				);
			}

			const response = await fetch(
				`/api/admin/user-requests/${solicitudId}/approve`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						commercialId: requiresCommercialAssignment
							? selectedCommercialId.trim()
							: null,
					}),
				},
			);

			const data = await response.json().catch(() => null);

			// Si la API rechaza la operación, se propaga el mensaje recibido.
			if (!response.ok) {
				throw new Error(data?.error || "No se pudo aprobar la solicitud");
			}

			// Si la aprobación es correcta, se vuelve al listado y se refresca.
			router.push("/admin/users/requests");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error inesperado");
		} finally {
			setApproveLoading(false);
		}
	}

	// RECHAZO DE SOLICITUD
	// Envía el rechazo junto con el motivo indicado por el administrador.
	async function handleRejectSubmit(e: React.FormEvent) {
		e.preventDefault();

		try {
			setError(null);
			setRejectLoading(true);

			const trimmedReason = rejectionReason.trim();

			// Valida que se haya indicado un motivo antes de rechazar.
			if (!trimmedReason) {
				throw new Error("Debes indicar un motivo de rechazo");
			}

			const response = await fetch(
				`/api/admin/user-requests/${solicitudId}/reject`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						reason: trimmedReason,
					}),
				},
			);

			const data = await response.json().catch(() => null);

			// Si la API devuelve error, se muestra el mensaje correspondiente.
			if (!response.ok) {
				throw new Error(data?.error || "No se pudo rechazar la solicitud");
			}

			// Si el rechazo es correcto, se vuelve al listado y se refresca.
			router.push("/admin/users/requests");
			router.refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error inesperado");
		} finally {
			setRejectLoading(false);
		}
	}

	// RENDER
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{/* BLOQUE DE APROBACIÓN */}
			{/* Permite confirmar el alta definitiva del usuario en el sistema. */}
			<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
				<h2 className="text-lg font-semibold text-emerald-800">
					Aprobar solicitud
				</h2>

				<p className="mt-2 text-sm text-emerald-700">
					Se creará el usuario definitivo en el sistema con los datos de esta
					solicitud.
				</p>

				{requiresCommercialAssignment ? (
					<div className="mt-4 space-y-2">
						<label className="block text-sm font-medium text-emerald-900">
							Comercial asignado
						</label>

						<select
							value={selectedCommercialId}
							onChange={(e) => setSelectedCommercialId(e.target.value)}
							disabled={loadingCommercials || approveLoading || rejectLoading}
							className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
						>
							<option value="">
								{loadingCommercials
									? "Cargando comerciales..."
									: "Selecciona un comercial"}
							</option>

							{commercials.map((commercial) => (
								<option key={commercial.id} value={commercial.id}>
									{getAdminCommercialLabel(commercial)}
								</option>
							))}
						</select>

						<p className="text-xs text-emerald-700">
							Al aprobar una solicitud de cliente, debe quedar asociado a un
							comercial.
						</p>
					</div>
				) : null}

				<div className="mt-4">
					<button
						type="button"
						onClick={() => void handleApprove()}
						disabled={approveLoading || rejectLoading}
						className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{approveLoading ? "Aprobando..." : "Confirmar aprobación"}
					</button>
				</div>
			</div>

			{/* BLOQUE DE RECHAZO */}
			{/* Recoge el motivo del rechazo para dejar constancia en el sistema. */}
			<SafeForm
				onSubmit={handleRejectSubmit}
				className="rounded-2xl border border-red-200 bg-red-50 p-5"
			>
				<h2 className="text-lg font-semibold text-red-800">
					Rechazar solicitud
				</h2>

				<p className="mt-2 text-sm text-red-700">
					Indique un motivo para dejar constancia del rechazo.
				</p>

				<div className="mt-4">
					<label className="mb-2 block text-sm font-medium text-red-900">
						Motivo del rechazo
					</label>

					<textarea
						value={rejectionReason}
						onChange={(e) => setRejectionReason(e.target.value)}
						rows={4}
						placeholder="Explique brevemente el motivo del rechazo..."
						className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-500"
					/>
				</div>

				<div className="mt-4">
					<SubmitButton
						isSubmitting={rejectLoading}
						disabled={approveLoading}
						submittingText="Rechazando..."
						className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
					>
						Confirmar rechazo
					</SubmitButton>
				</div>
			</SafeForm>

			{/* FEEDBACK DE ERROR */}
			{/* Se muestra un mensaje común si falla cualquiera de las dos acciones. */}
			{error && (
				<div className="lg:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			)}
		</div>
	);
}

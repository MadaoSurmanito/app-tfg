"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
	solicitudId: string;
};

// Componente cliente que permite aprobar o rechazar una solicitud de registro.
// Gestiona el estado local de carga, validación y errores de ambas acciones.
export default function RequestsActions({ solicitudId }: Props) {
	// NAVEGACIÓN
	// Se utiliza para redirigir y refrescar la vista tras completar una acción.
	const router = useRouter();

	// ESTADO LOCAL
	// Controla el motivo de rechazo, las cargas independientes de cada acción
	// y un mensaje común de error.
	const [rejectionReason, setRejectionReason] = useState("");
	const [approveLoading, setApproveLoading] = useState(false);
	const [rejectLoading, setRejectLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// APROBACIÓN DE SOLICITUD
	// Envía la aprobación a la API y, si se completa correctamente,
	// vuelve al listado general de solicitudes.
	async function handleApprove() {
		try {
			setError(null);
			setApproveLoading(true);

			const response = await fetch(
				`/api/admin/user-requests/${solicitudId}/approve`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
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
	async function handleRejectSubmit(e: React.FormEvent<HTMLFormElement>) {
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
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			{/* BLOQUE DE APROBACIÓN */}
			{/* Permite confirmar el alta definitiva del usuario en el sistema. */}
			<div className="rounded-2xl border border-green-200 bg-white p-6 shadow-md">
				<h2 className="text-lg font-semibold text-slate-800">
					Aprobar solicitud
				</h2>
				<p className="mt-2 text-sm text-slate-600">
					Se creará el usuario definitivo en el sistema con los datos de esta
					solicitud.
				</p>

				<button
					type="button"
					onClick={handleApprove}
					disabled={approveLoading || rejectLoading}
					className="mt-4 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{approveLoading ? "Aprobando..." : "Confirmar aprobación"}
				</button>
			</div>

			{/* BLOQUE DE RECHAZO */}
			{/* Recoge el motivo del rechazo para dejar constancia en el sistema. */}
			<form
				onSubmit={handleRejectSubmit}
				className="rounded-2xl border border-red-200 bg-white p-6 shadow-md"
			>
				<h2 className="text-lg font-semibold text-slate-800">
					Rechazar solicitud
				</h2>
				<p className="mt-2 text-sm text-slate-600">
					Indique un motivo para dejar constancia del rechazo.
				</p>

				<div className="mt-4 space-y-4">
					<div>
						<label
							htmlFor="rejectionReason"
							className="mb-1 block text-sm font-semibold text-slate-700"
						>
							Motivo del rechazo
						</label>
						<textarea
							id="rejectionReason"
							name="rejectionReason"
							required
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							rows={4}
							placeholder="Explique brevemente el motivo del rechazo..."
							className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-500"
						/>
					</div>

					<button
						type="submit"
						disabled={approveLoading || rejectLoading}
						className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{rejectLoading ? "Rechazando..." : "Confirmar rechazo"}
					</button>
				</div>
			</form>

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

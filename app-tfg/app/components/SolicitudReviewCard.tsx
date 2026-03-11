import Link from "next/link";

type Solicitud = {
	id: string;
	name: string;
	email: string;
	company: string;
	phone: string | null;
	requested_at: string | Date;
};

type Props = {
	title: string;
	description: string;
	solicitud: Solicitud;
	actionLabel: string;
	actionHref: string;
	actionColor: "green" | "red";
	showRejectionReason?: boolean;
};

function formatFecha(fecha: string | Date) {
	return new Intl.DateTimeFormat("es-ES", {
		timeZone: "Europe/Madrid",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(fecha));
}

export default function SolicitudReviewCard({
	title,
	description,
	solicitud,
	actionLabel,
	actionHref,
	actionColor,
	showRejectionReason = false,
}: Props) {
	const actionClasses =
		actionColor === "green"
			? "bg-green-600 hover:bg-green-700"
			: "bg-red-600 hover:bg-red-700";

	return (
		<div className="mx-auto mt-6 w-full max-w-3xl">
			<div className="rounded-2xl bg-white p-6 shadow-md">
				<h2 className="text-xl font-semibold text-slate-800">{title}</h2>

				<p className="mt-2 text-sm text-slate-600">{description}</p>

				<div className="mt-6 grid gap-4 sm:grid-cols-2">
					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-medium uppercase text-slate-500">
							Nombre
						</p>
						<p className="mt-1 text-sm text-slate-800">{solicitud.name}</p>
					</div>

					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-medium uppercase text-slate-500">
							Correo
						</p>
						<p className="mt-1 text-sm text-slate-800">{solicitud.email}</p>
					</div>

					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-medium uppercase text-slate-500">
							Empresa
						</p>
						<p className="mt-1 text-sm text-slate-800">{solicitud.company}</p>
					</div>

					<div className="rounded-xl bg-slate-50 p-4">
						<p className="text-xs font-medium uppercase text-slate-500">
							Teléfono
						</p>
						<p className="mt-1 text-sm text-slate-800">
							{solicitud.phone || "-"}
						</p>
					</div>

					<div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
						<p className="text-xs font-medium uppercase text-slate-500">
							Fecha de solicitud
						</p>
						<p className="mt-1 text-sm text-slate-800">
							{formatFecha(solicitud.requested_at)}
						</p>
					</div>
				</div>

				{showRejectionReason ? (
					<form action={actionHref} method="POST" className="mt-6">
						<label
							htmlFor="rejection_reason"
							className="mb-2 block text-sm font-medium text-slate-700"
						>
							Motivo del rechazo
						</label>

						<textarea
							id="rejection_reason"
							name="rejection_reason"
							rows={4}
							placeholder="Escriba aquí el motivo del rechazo..."
							className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-black"
						/>

						<div className="mt-6 flex flex-wrap gap-3">
							<button
								type="submit"
								className={`rounded-lg px-4 py-2 font-medium text-white transition ${actionClasses}`}
							>
								{actionLabel}
							</button>

							<Link
								href="/admin/solicitudes"
								className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-800 transition hover:bg-slate-300"
							>
								Cancelar
							</Link>
						</div>
					</form>
				) : (
					<div className="mt-6 flex flex-wrap gap-3">
						<form action={actionHref} method="POST">
							<button
								type="submit"
								className={`rounded-lg px-4 py-2 font-medium text-white transition ${actionClasses}`}
							>
								{actionLabel}
							</button>
						</form>

						<Link
							href="/admin/solicitudes"
							className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-800 transition hover:bg-slate-300"
						>
							Cancelar
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

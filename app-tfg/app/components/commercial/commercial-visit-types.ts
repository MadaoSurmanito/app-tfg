export type CommercialVisitStatusCode = "planned" | "completed" | "cancelled";

export type CommercialVisitClientUser = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	profile_image_url: string | null;
};

export type CommercialVisitClient = {
	id: string;
	name: string;
	contact_name: string | null;
	city: string;
	province: string | null;
	user: CommercialVisitClientUser | null;
};

export type CommercialVisitCommercialUser = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
};

export type CommercialVisitCommercial = {
	id: string;
	employee_code: string | null;
	territory: string | null;
	user: CommercialVisitCommercialUser | null;
};

export type CommercialVisitStatus = {
	id: number;
	code?: CommercialVisitStatusCode;
	name?: string;
};

export type CommercialVisit = {
	id: string;
	client_id: string;
	commercial_id: string;
	scheduled_at: string;
	status_id: number;
	notes: string | null;
	result: string | null;
	client: CommercialVisitClient | null;
	commercial: CommercialVisitCommercial | null;
	status: CommercialVisitStatus | null;
};

export const COMMERCIAL_VISIT_STATUS_OPTIONS = [
	{ id: 1, label: "Planificada" },
	{ id: 2, label: "Completada" },
	{ id: 3, label: "Cancelada" },
] as const;

export function getVisitStatusLabel(statusId: number) {
	switch (statusId) {
		case 1:
			return "Planificada";
		case 2:
			return "Completada";
		case 3:
			return "Cancelada";
		default:
			return "Desconocido";
	}
}

export function getVisitStatusClasses(statusId: number) {
	switch (statusId) {
		case 1:
			return "bg-amber-50 text-amber-700";
		case 2:
			return "bg-emerald-50 text-emerald-700";
		case 3:
			return "bg-rose-50 text-rose-700";
		default:
			return "bg-slate-100 text-slate-700";
	}
}

export function formatVisitDateTime(value: string | null | undefined) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("es-ES", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export function toDateTimeLocalValue(value: string | null | undefined) {
	if (!value) {
		return "";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "";
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export type AdminCommercialOption = {
	id: string;
	employee_code?: string | null;
	territory?: string | null;
	user?: {
		id: string;
		name?: string | null;
		email?: string | null;
	} | null;
};

export async function fetchAdminCommercialOptions() {
	const response = await fetch("/api/admin/commercials", {
		method: "GET",
		cache: "no-store",
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || "No se pudieron cargar los comerciales");
	}

	return Array.isArray(data) ? (data as AdminCommercialOption[]) : [];
}

export function getAdminCommercialLabel(commercial: AdminCommercialOption) {
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

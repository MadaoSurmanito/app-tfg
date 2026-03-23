// Archivo de utilidades para la tabla de usuarios, contiene funciones para formatear fechas, comparar valores, obtener etiquetas y clases para roles y estados, etc.

// Tipos y funciones comunes para la gestión de usuarios en la tabla
export type Usuario = {
	id: string;
	name: string;
	email: string;
	company: string | null;
	phone: string | null;
	role: "admin" | "client" | "commercial";
	status: "active" | "inactive" | "blocked";
	profile_image_url: string | null;
	created_at: string;
	last_login_at: string | null;
};

export type SortField = keyof Usuario;
export type SortDirection = "asc" | "desc";

export const sortableFields: { key: SortField; label: string }[] = [
	{ key: "id", label: "ID" },
	{ key: "name", label: "Nombre" },
	{ key: "email", label: "Correo" },
	{ key: "company", label: "Empresa" },
	{ key: "phone", label: "Teléfono" },
	{ key: "role", label: "Rol" },
	{ key: "status", label: "Estado" },
	{ key: "profile_image_url", label: "Imagen" },
	{ key: "created_at", label: "Fecha de alta" },
	{ key: "last_login_at", label: "Último login" },
];

// Función para formatear fechas en formato largo
export function formatDate(value: string | null) {
	if (!value) return "-";

	return new Date(value).toLocaleString("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

// Función para normalizar valores a string en minúsculas, útil para comparaciones y filtrados
export function normalizeValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	return String(value).toLowerCase();
}

// Función para comparar valores de diferentes tipos, con soporte para fechas y strings
export function compareValues(a: unknown, b: unknown) {
	if (a === null || a === undefined) return 1;
	if (b === null || b === undefined) return -1;

	const aDate =
		typeof a === "string" && !Number.isNaN(Date.parse(a))
			? Date.parse(a)
			: null;
	const bDate =
		typeof b === "string" && !Number.isNaN(Date.parse(b))
			? Date.parse(b)
			: null;

	if (aDate !== null && bDate !== null) {
		return aDate - bDate;
	}

	return String(a).localeCompare(String(b), "es", { sensitivity: "base" });
}

// Funciones para obtener etiquetas y clases CSS según el rol y estado del usuario
export function getRoleLabel(role: Usuario["role"]) {
	switch (role) {
		case "admin":
			return "Administrador";
		case "client":
			return "Cliente";
		case "commercial":
			return "Comercial";
		default:
			return role;
	}
}

// Función para obtener la etiqueta del estado del usuario
export function getStatusLabel(status: Usuario["status"]) {
	switch (status) {
		case "active":
			return "Activo";
		case "inactive":
			return "Inactivo";
		case "blocked":
			return "Bloqueado";
		default:
			return status;
	}
}

// Funciones para obtener las clases CSS según el rol y estado del usuario, para mostrar diferentes colores en la tabla
export function getRoleClasses(role: Usuario["role"]) {
	switch (role) {
		case "admin":
			return "bg-red-500/20 text-red-200";
		case "client":
			return "bg-emerald-500/20 text-emerald-200";
		case "commercial":
			return "bg-blue-500/20 text-blue-200";
		default:
			return "bg-white/10 text-white";
	}
}

// Función para obtener las clases CSS según el estado del usuario, para mostrar diferentes colores en la tabla
export function getStatusClasses(status: Usuario["status"]) {
	switch (status) {
		case "active":
			return "bg-green-500/20 text-green-200";
		case "inactive":
			return "bg-yellow-500/20 text-yellow-200";
		case "blocked":
			return "bg-red-500/20 text-red-200";
		default:
			return "bg-white/10 text-white";
	}
}

// Función para formatear fechas en formato corto (dd/mm/aa)
export function formatDateShort(value: string | null) {
	if (!value) return "-";

	return new Date(value).toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	});
}

// Versiones light de las funciones para obtener clases CSS, con colores más suaves para usar en fondos claros
export function getRoleClassesLight(role: Usuario["role"]) {
	switch (role) {
		case "admin":
			return "bg-red-100 text-red-700";
		case "client":
			return "bg-emerald-100 text-emerald-700";
		case "commercial":
			return "bg-blue-100 text-blue-700";
		default:
			return "bg-slate-100 text-slate-700";
	}
}

// Función para obtener las clases CSS según el estado del usuario, para mostrar diferentes colores en la tabla, versión light para fondos claros
export function getStatusClassesLight(status: Usuario["status"]) {
	switch (status) {
		case "active":
			return "bg-green-100 text-green-700";
		case "inactive":
			return "bg-yellow-100 text-yellow-700";
		case "blocked":
			return "bg-red-100 text-red-700";
		default:
			return "bg-slate-100 text-slate-700";
	}
}

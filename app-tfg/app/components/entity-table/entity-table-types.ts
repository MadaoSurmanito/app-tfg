// Tipos visuales reutilizables para representar elementos dentro
// de la tabla/listado genérico de entidades.

export type EntityTableBadge = {
	label: string;
	className?: string;
};

export type EntityTableAction = {
	label: string;
	href: string;
	variant?: "primary" | "secondary" | "warning";
};

export type EntityTableField = {
	label: string;
	value: string;
};

export type EntityTableItem = {
	id: string;
	title: string;
	subtitle: string;
	imageUrl?: string | null;
	category?: string | null;
	status?: string | null;
	primaryDate?: string | null;
	secondaryDate?: string | null;
	badges?: EntityTableBadge[];
	fields: EntityTableField[];
	actions?: EntityTableAction[];
	searchText?: string;
};

export type EntityTableConfig = {
	categoryLabel?: string;
	statusLabel?: string;
	showImageFilter?: boolean;
	showHideInactiveToggle?: boolean;
	hideInactiveLabel?: string;
	defaultHideInactive?: boolean;
	emptyMessage?: string;
};

export type EntitySortField =
	| "title"
	| "subtitle"
	| "category"
	| "status"
	| "primaryDate";

export type EntitySortDirection = "asc" | "desc";
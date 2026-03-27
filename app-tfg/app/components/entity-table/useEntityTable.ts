"use client";

import { useMemo, useState } from "react";
import type {
	EntitySortDirection,
	EntitySortField,
	EntityTableConfig,
	EntityTableItem,
} from "./entity-table-types";

// Normaliza un valor para facilitar búsquedas y comparaciones
// sin diferenciar mayúsculas, minúsculas ni tildes.
function normalizeValue(value: unknown) {
	return String(value ?? "")
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();
}

// Compara dos valores de texto ya normalizados para ordenación.
function compareValues(a: unknown, b: unknown) {
	const aValue = normalizeValue(a);
	const bValue = normalizeValue(b);

	if (aValue < bValue) return -1;
	if (aValue > bValue) return 1;
	return 0;
}

// Hook reutilizable para gestionar búsqueda, filtros y ordenación
// de cualquier listado basado en EntityTableItem.
export function useEntityTable(
	items: EntityTableItem[],
	config?: EntityTableConfig,
) {
	// ESTADO LOCAL
	// Controla la búsqueda, filtros activos y orden actual del listado.
	const [search, setSearch] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("todos");
	const [statusFilter, setStatusFilter] = useState("todos");
	const [hasImageFilter, setHasImageFilter] = useState("todos");
	const [hideInactiveItems, setHideInactiveItems] = useState(
		config?.defaultHideInactive ?? false,
	);
	const [sortField, setSortField] = useState<EntitySortField>("primaryDate");
	const [sortDirection, setSortDirection] =
		useState<EntitySortDirection>("desc");

	// OPCIONES DE FILTRO
	// Extrae dinámicamente las categorías presentes en los elementos.
	const categories = useMemo(
		() =>
			[
				...new Set(
					items.map((item) => item.category).filter(Boolean) as string[],
				),
			].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })),
		[items],
	);

	// Extrae dinámicamente los estados presentes en los elementos.
	const statuses = useMemo(
		() =>
			[
				...new Set(
					items.map((item) => item.status).filter(Boolean) as string[],
				),
			].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" })),
		[items],
	);

	// DATOS FILTRADOS Y ORDENADOS
	// Aplica búsqueda, filtros y ordenación sobre la colección recibida.
	const filteredAndSortedItems = useMemo(() => {
		const searchTerm = normalizeValue(search.trim());

		const filtered = items.filter((item) => {
			const haystack = normalizeValue(
				item.searchText ??
					[
						item.title,
						item.subtitle,
						item.category,
						item.status,
						item.primaryDate,
						item.secondaryDate,
						...item.fields.map((field) => field.value),
					].join(" "),
			);

			const matchesSearch = searchTerm === "" || haystack.includes(searchTerm);

			const matchesCategory =
				categoryFilter === "todos" || item.category === categoryFilter;

			const matchesStatus =
				statusFilter === "todos" || item.status === statusFilter;

			const matchesImage =
				!config?.showImageFilter ||
				hasImageFilter === "todos" ||
				(hasImageFilter === "con_imagen" && Boolean(item.imageUrl)) ||
				(hasImageFilter === "sin_imagen" && !item.imageUrl);

			const matchesHideInactive =
				!config?.showHideInactiveToggle ||
				!hideInactiveItems ||
				item.status?.toLowerCase() !== "inactive";

			return (
				matchesSearch &&
				matchesCategory &&
				matchesStatus &&
				matchesImage &&
				matchesHideInactive
			);
		});

		return filtered.toSorted((a, b) => {
			const valueA = a[sortField];
			const valueB = b[sortField];
			const result = compareValues(valueA, valueB);
			return sortDirection === "asc" ? result : -result;
		});
	}, [
		items,
		search,
		categoryFilter,
		statusFilter,
		hasImageFilter,
		hideInactiveItems,
		sortField,
		sortDirection,
		config?.showImageFilter,
		config?.showHideInactiveToggle,
	]);

	// RESETEO DE FILTROS
	// Restablece todos los filtros al estado inicial configurado.
	function resetFilters() {
		setSearch("");
		setCategoryFilter("todos");
		setStatusFilter("todos");
		setHasImageFilter("todos");
		setHideInactiveItems(config?.defaultHideInactive ?? false);
		setSortField("primaryDate");
		setSortDirection("desc");
	}

	return {
		search,
		setSearch,
		categoryFilter,
		setCategoryFilter,
		statusFilter,
		setStatusFilter,
		hasImageFilter,
		setHasImageFilter,
		hideInactiveItems,
		setHideInactiveItems,
		sortField,
		setSortField,
		sortDirection,
		setSortDirection,
		categories,
		statuses,
		filteredAndSortedItems,
		resetFilters,
	};
}

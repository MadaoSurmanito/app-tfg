"use client";

import { useMemo, useState } from "react";
import {
	compareValues,
	normalizeValue,
	type SortDirection,
	type SortField,
	type Usuario,
} from "./users-table-utils";

// Hook con toda la lógica de búsqueda, filtros y ordenación.
export function useUsersTable(usuarios: Usuario[]) {
	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("todos");
	const [statusFilter, setStatusFilter] = useState("todos");
	const [hasImageFilter, setHasImageFilter] = useState("todos");
	const [hideInactiveUsers, setHideInactiveUsers] = useState(true);
	const [sortField, setSortField] = useState<SortField>("created_at");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const roles = useMemo(
		() =>
			[...new Set(usuarios.map((u) => u.role))].sort((a, b) =>
				a.localeCompare(b, "es", { sensitivity: "base" }),
			),
		[usuarios],
	);

	const statuses = useMemo(
		() =>
			[...new Set(usuarios.map((u) => u.status))].sort((a, b) =>
				a.localeCompare(b, "es", { sensitivity: "base" }),
			),
		[usuarios],
	);

	const filteredAndSortedUsers = useMemo(() => {
		const searchTerm = search.trim().toLowerCase();

		const filtered = usuarios.filter((usuario) => {
			const matchesSearch =
				searchTerm === "" ||
				Object.values(usuario).some((value) =>
					normalizeValue(value).includes(searchTerm),
				);

			const matchesRole = roleFilter === "todos" || usuario.role === roleFilter;
			const matchesStatus =
				statusFilter === "todos" || usuario.status === statusFilter;

			const matchesImage =
				hasImageFilter === "todos" ||
				(hasImageFilter === "con_imagen" &&
					Boolean(usuario.profile_image_url)) ||
				(hasImageFilter === "sin_imagen" && !usuario.profile_image_url);

			const matchesHideInactiveUsers =
				!hideInactiveUsers || usuario.status !== "inactive";

			return (
				matchesSearch &&
				matchesRole &&
				matchesStatus &&
				matchesImage &&
				matchesHideInactiveUsers
			);
		});

		return filtered.toSorted((a, b) => {
			const result = compareValues(a[sortField], b[sortField]);
			return sortDirection === "asc" ? result : -result;
		});
	}, [
		usuarios,
		search,
		roleFilter,
		statusFilter,
		hasImageFilter,
		hideInactiveUsers,
		sortField,
		sortDirection,
	]);

	function handleSort(field: SortField) {
		if (sortField === field) {
			setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
			return;
		}

		setSortField(field);
		setSortDirection("asc");
	}

	function resetFilters() {
		setSearch("");
		setRoleFilter("todos");
		setStatusFilter("todos");
		setHasImageFilter("todos");
		setHideInactiveUsers(true);
		setSortField("created_at");
		setSortDirection("desc");
	}

	return {
		search,
		setSearch,
		roleFilter,
		setRoleFilter,
		statusFilter,
		setStatusFilter,
		hasImageFilter,
		setHasImageFilter,
		hideInactiveUsers,
		setHideInactiveUsers,
		sortField,
		setSortField,
		sortDirection,
		setSortDirection,
		roles,
		statuses,
		filteredAndSortedUsers,
		handleSort,
		resetFilters,
	};
}

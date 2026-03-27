"use client";

import { useEffect, useRef, useState } from "react";
import type {
	EntitySortDirection,
	EntitySortField,
	EntityTableConfig,
} from "./entity-table-types";

type Props = {
	search: string;
	setSearch: (value: string) => void;
	categoryFilter: string;
	setCategoryFilter: (value: string) => void;
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	hasImageFilter: string;
	setHasImageFilter: (value: string) => void;
	hideInactiveItems: boolean;
	setHideInactiveItems: (value: boolean) => void;
	sortField: EntitySortField;
	setSortField: (value: EntitySortField) => void;
	sortDirection: EntitySortDirection;
	setSortDirection: (value: EntitySortDirection) => void;
	categories: string[];
	statuses: string[];
	filteredCount: number;
	totalCount: number;
	resetFilters: () => void;
	config?: EntityTableConfig;
};

// Panel reutilizable de filtros para el listado genérico de entidades.
export default function EntityTableFilters({
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
	filteredCount,
	totalCount,
	resetFilters,
	config,
}: Props) {
	// ESTADO LOCAL
	// Controla la apertura del panel desplegable de filtros.
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [contentHeight, setContentHeight] = useState(0);
	const contentRef = useRef<HTMLDivElement | null>(null);

	// ALTURA DEL CONTENIDO
	// Recalcula la altura real del bloque para animar su apertura y cierre.
	useEffect(() => {
		const updateHeight = () => {
			if (contentRef.current) {
				setContentHeight(contentRef.current.scrollHeight);
			}
		};

		updateHeight();
		window.addEventListener("resize", updateHeight);
		return () => window.removeEventListener("resize", updateHeight);
	}, [isFiltersOpen, filteredCount, totalCount]);

	// RENDER
	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md md:p-5">
			{/* CABECERA Y TOGGLE DE FILTROS */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-base font-semibold text-slate-800">Filtros</h2>
					<p className="text-sm text-slate-500">
						Mostrando <strong>{filteredCount}</strong> de{" "}
						<strong>{totalCount}</strong>
					</p>
				</div>

				<button
					type="button"
					onClick={() => setIsFiltersOpen((prev) => !prev)}
					className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
				>
					{isFiltersOpen ? "Ocultar filtros" : "Mostrar filtros"}
				</button>
			</div>
			{/* CONTENIDO DESPLEGABLE DE FILTROS */}
			<div
				className="overflow-hidden transition-all duration-300 ease-in-out"
				style={{
					maxHeight: isFiltersOpen ? `${contentHeight}px` : "0px",
					opacity: isFiltersOpen ? 1 : 0,
					marginTop: isFiltersOpen ? "1rem" : "0rem",
				}}
			>
				<div ref={contentRef} className="space-y-4">
					{/* FILTROS PRINCIPALES */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
						{/* El filtro de búsqueda es común a todas las tablas, pero los de categoría y estado solo se muestran si hay datos para filtrar. */}
						<div>
							<label className="mb-1 block text-sm font-semibold text-slate-700">
								Buscar
							</label>
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Buscar..."
								className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-500"
							/>
						</div>
						{/* Solo se muestran los filtros de categoría y estado si hay datos para filtrar por esos campos, evitando mostrar opciones vacías. */}
						{categories.length > 0 ? (
							<div>
								<label className="mb-1 block text-sm font-semibold text-slate-700">
									{config?.categoryLabel ?? "Categoría"}
								</label>
								<select
									value={categoryFilter}
									onChange={(e) => setCategoryFilter(e.target.value)}
									className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
								>
									<option value="todos">Todos</option>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
							</div>
						) : null}
						{statuses.length > 0 ? (
							<div>
								<label className="mb-1 block text-sm font-semibold text-slate-700">
									{config?.statusLabel ?? "Estado"}
								</label>
								<select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
								>
									<option value="todos">Todos</option>
									{statuses.map((status) => (
										<option key={status} value={status}>
											{status}
										</option>
									))}
								</select>
							</div>
						) : null}

						{config?.showImageFilter ? (
							<div>
								<label className="mb-1 block text-sm font-semibold text-slate-700">
									Imagen
								</label>
								<select
									value={hasImageFilter}
									onChange={(e) => setHasImageFilter(e.target.value)}
									className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
								>
									<option value="todos">Todos</option>
									<option value="con_imagen">Con imagen</option>
									<option value="sin_imagen">Sin imagen</option>
								</select>
							</div>
						) : null}
					</div>

					{/* FILTROS SECUNDARIOS Y ORDEN */}
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
							{config?.showHideInactiveToggle ? (
								<label className="flex items-center gap-2 text-sm text-slate-700">
									<input
										type="checkbox"
										checked={hideInactiveItems}
										onChange={(e) => setHideInactiveItems(e.target.checked)}
										className="h-4 w-4 rounded border-gray-300"
									/>
									{config.hideInactiveLabel ?? "Ocultar inactivos"}
								</label>
							) : null}

							<div>
								<label className="mb-1 block text-sm font-semibold text-slate-700">
									Ordenar por
								</label>
								<select
									value={sortField}
									onChange={(e) =>
										setSortField(e.target.value as EntitySortField)
									}
									className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
								>
									<option value="primaryDate">Fecha</option>
									<option value="title">Título</option>
									<option value="subtitle">Subtítulo</option>
									<option value="category">Categoría</option>
									<option value="status">Estado</option>
								</select>
							</div>

							<div>
								<label className="mb-1 block text-sm font-semibold text-slate-700">
									Dirección
								</label>
								<select
									value={sortDirection}
									onChange={(e) =>
										setSortDirection(e.target.value as EntitySortDirection)
									}
									className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-slate-800 outline-none transition focus:border-slate-500"
								>
									<option value="asc">Ascendente</option>
									<option value="desc">Descendente</option>
								</select>
							</div>
						</div>

						<button
							type="button"
							onClick={resetFilters}
							className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-gray-50"
						>
							Limpiar filtros
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

"use client";

import type { Usuario } from "./users-table-utils";
import { useUsersTable } from "./useUsersTable";
import { UsersTableFilters } from "./UsersTableFilters";
import { UsersTableView } from "./UsersTableView";
import PageTransition from "@/app/components/PageTransition";

type Props = {
	usuarios: Usuario[];
};

export default function UsersTable({ usuarios }: Props) {
	const table = useUsersTable(usuarios);

	return (
		<PageTransition>
			<div className="space-y-4">
				<UsersTableFilters {...table} totalUsuarios={usuarios.length} />
				<UsersTableView {...table} />
			</div>
		</PageTransition>
	);
}

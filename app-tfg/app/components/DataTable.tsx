import React from "react";

type Column<T> = {
	key: string;
	header: string;
	className?: string;
	render: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
	data: T[];
	columns: Column<T>[];
	emptyMessage?: string;
	getRowKey: (item: T) => string;
};

export default function DataTable<T>({
	data,
	columns,
	emptyMessage = "No hay datos.",
	getRowKey,
}: DataTableProps<T>) {
	return (
		<div className="overflow-hidden rounded-2xl bg-white shadow-md">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							{columns.map((column) => (
								<th
									key={column.key}
									className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${
										column.className ?? ""
									}`}
								>
									{column.header}
								</th>
							))}
						</tr>
					</thead>

					<tbody className="divide-y divide-gray-200 bg-white">
						{data.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="px-6 py-8 text-center text-sm text-slate-500"
								>
									{emptyMessage}
								</td>
							</tr>
						) : (
							data.map((item) => (
								<tr key={getRowKey(item)}>
									{columns.map((column) => (
										<td
											key={column.key}
											className="whitespace-nowrap px-6 py-4 text-sm text-slate-800"
										>
											{column.render(item)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
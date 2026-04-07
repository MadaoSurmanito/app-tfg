import { getDataSource } from "@/app/lib/typeorm/data-source";
import { Client } from "@/app/lib/typeorm/entities/Client";

export async function listClients() {
	const ds = await getDataSource();

	const repo = ds.getRepository(Client);

	return repo.find({
		relations: {
			assignedCommercial: true,
			linkedUser: true,
		},
		order: {
			created_at: "DESC",
		},
	});
}
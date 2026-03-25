import { getDataSource } from "@/app/lib/typeorm/data-source";
import { Role } from "@/app/lib/typeorm/entities/Role";

export async function listRoles() {
	const ds = await getDataSource();
	const repo = ds.getRepository("Role");

	return repo.find({
		order: {
			id: "ASC",
		},
	});
}

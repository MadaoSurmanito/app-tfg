import { getDataSource } from "@/lib/typeorm/data-source";
import { UserStatus } from "@/lib/typeorm/entities/UserStatus";

export async function listUserStatuses() {
	const ds = await getDataSource();
	const repo = ds.getRepository(UserStatus);

	return repo.find({
		order: {
			id: "ASC",
		},
	});
}
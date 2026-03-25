import { getDataSource } from "@/app/lib/typeorm/data-source";
import { UserRequest } from "@/app/lib/typeorm/entities/UserRequest";
import { REQUEST_STATUS_IDS } from "@/app/lib/typeorm/constants/catalog-ids";

export async function listUserRequests() {
	const ds = await getDataSource();

	const repo = ds.getRepository(UserRequest);

	return repo.find({
		where: {
			status_id: REQUEST_STATUS_IDS.PENDING,
		},
		relations: {
			requestedRole: true,
			status: true,
			requestSourceType: true,
			reviewedByUser: true,
			createdUser: true,
		},
		order: {
			requested_at: "DESC",
		},
	});
}

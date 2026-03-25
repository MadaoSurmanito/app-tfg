import { getDataSource } from "@/app/lib/typeorm/data-source";
import { UserRequest } from "@/app/lib/typeorm/entities/UserRequest";

// Lista las solicitudes de usuario incluyendo todas las relaciones
// necesarias para poder pintarlas en administración sin consultas extra.
export async function listUserRequests() {
	const ds = await getDataSource();
	const repo = ds.getRepository(UserRequest);

	return repo.find({
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

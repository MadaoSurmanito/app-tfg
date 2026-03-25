import { getDataSource } from "@/app/lib/typeorm/data-source";
import { UserRequest } from "@/app/lib/typeorm/entities/UserRequest";

// Devuelve una solicitud concreta por su ID con todas sus relaciones.
// Se reutiliza tanto desde páginas server como desde la API.
export async function getUserRequestById(id: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(UserRequest);

	return repo.findOne({
		where: { id },
		relations: {
			requestedRole: true,
			status: true,
			requestSourceType: true,
			reviewedByUser: true,
			createdUser: true,
		},
	});
}
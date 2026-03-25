import { getDataSource } from "@/lib/typeorm/data-source";
import { User } from "@/lib/typeorm/entities/User";

// Obtiene un usuario por su ID, incluyendo rol y estado.
// Este servicio se reutiliza tanto en páginas server como en endpoints API.
export async function getUserById(id: string) {
	const ds = await getDataSource();
	const repo = ds.getRepository(User);

	return repo.findOne({
		where: { id },
		relations: {
			role: true,
			status: true,
		},
	});
}
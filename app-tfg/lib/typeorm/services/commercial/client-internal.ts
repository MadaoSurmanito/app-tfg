import { EntityManager } from "typeorm";
import { Client } from "@/lib/typeorm/entities/Client";

// --------------------------------------------------------------------------
// Servicio interno: creación automática de cliente desde usuario
// --------------------------------------------------------------------------

type CreateClientFromUserInput = {
	userId: string;
	name: string;
	company?: string | null;
};

// Este servicio NO valida roles ni permisos.
// Se usa internamente dentro de otros servicios (ej: registerUserByAdmin).
export async function createClientFromUser(
	manager: EntityManager,
	input: CreateClientFromUserInput,
) {
	const repo = manager.getRepository(Client);

	const existing = await repo.findOne({
		where: { id: input.userId },
	});

	if (existing) {
		return existing;
	}

	const client = repo.create({
		id: input.userId,
		name: input.company || input.name,
		contact_name: input.name,
		address: "Pendiente",
		city: "Pendiente",
		notes: "Cliente creado automáticamente",
	});

	return repo.save(client);
}

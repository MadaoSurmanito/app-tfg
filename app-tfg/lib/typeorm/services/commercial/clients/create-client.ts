import { getDataSource } from "@/lib/typeorm/data-source";
import { Client } from "@/lib/typeorm/entities/Client";
import { User } from "@/lib/typeorm/entities/User";
import { ROLE_IDS } from "@/lib/typeorm/constants/catalog-ids";

type CreateClientInput = {
	name: string;
	contactName?: string | null;
	taxId?: string | null;
	address: string;
	city: string;
	postalCode?: string | null;
	province?: string | null;
	assignedCommercialId: string;
	linkedUserId: string;
	notes?: string | null;
};

export class CreateClientError extends Error {
	status: number;
	code: string;

	constructor(message: string, status = 400, code = "CREATE_CLIENT_ERROR") {
		super(message);
		this.name = "CreateClientError";
		this.status = status;
		this.code = code;
	}
}

function normalizeText(value: string | null | undefined) {
	return String(value ?? "").trim();
}

export async function createClient(input: CreateClientInput) {
	const ds = await getDataSource();

	return ds.transaction(async (manager) => {
		const clientRepo = manager.getRepository(Client);
		const userRepo = manager.getRepository(User);

		const name = normalizeText(input.name);
		const address = normalizeText(input.address);
		const city = normalizeText(input.city);

		if (!name) {
			throw new CreateClientError("El nombre del cliente es obligatorio");
		}

		if (!address) {
			throw new CreateClientError("La dirección es obligatoria");
		}

		if (!city) {
			throw new CreateClientError("La ciudad es obligatoria");
		}

		const assignedCommercial = await userRepo.findOne({
			where: { id: input.assignedCommercialId },
		});

		if (!assignedCommercial) {
			throw new CreateClientError("El comercial asignado no existe", 404);
		}

		if (assignedCommercial.role_id !== ROLE_IDS.COMMERCIAL) {
			throw new CreateClientError("El usuario asignado no es un comercial válido");
		}

		const linkedUser = await userRepo.findOne({
			where: { id: input.linkedUserId },
		});

		if (!linkedUser) {
			throw new CreateClientError("El usuario vinculado no existe", 404);
		}

		if (linkedUser.role_id !== ROLE_IDS.CLIENT) {
			throw new CreateClientError("El usuario vinculado no es un cliente válido");
		}

		const existingClient = await clientRepo.findOne({
			where: { linked_user_id: input.linkedUserId },
		});

		if (existingClient) {
			throw new CreateClientError("Ya existe un cliente asociado a este usuario");
		}

		const client = clientRepo.create({
			name,
			contact_name: normalizeText(input.contactName) || null,
			tax_id: normalizeText(input.taxId) || null,
			address,
			city,
			postal_code: normalizeText(input.postalCode) || null,
			province: normalizeText(input.province) || null,
			assigned_commercial_id: input.assignedCommercialId,
			linked_user_id: input.linkedUserId,
			notes: normalizeText(input.notes) || null,
		});

		return clientRepo.save(client);
	});
}
import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";

import { Role } from "@/lib/typeorm/entities/Role";
import { UserStatus } from "@/lib/typeorm/entities/UserStatus";
import { RequestStatus } from "@/lib/typeorm/entities/RequestStatus";
import { RequestSourceType } from "@/lib/typeorm/entities/RequestSourceType";
import { AccessEventType } from "@/lib/typeorm/entities/AccessEventType";
import { AccessResultType } from "@/lib/typeorm/entities/AccessResultType";
import { UserAdminActionType } from "@/lib/typeorm/entities/UserAdminActionType";
import { User } from "@/lib/typeorm/entities/User";
import { UserRequest } from "@/lib/typeorm/entities/UserRequest";
import { UserManagementLog } from "@/lib/typeorm/entities/UserManagementLog";
import { UserAccessLog } from "@/lib/typeorm/entities/UserAccessLog";

const entities = [
	Role,
	UserStatus,
	RequestStatus,
	RequestSourceType,
	AccessEventType,
	AccessResultType,
	UserAdminActionType,
	User,
	UserRequest,
	UserManagementLog,
	UserAccessLog,
];

function createDataSource() {
	return new DataSource({
		type: "postgres",
		url: process.env.DATABASE_URL,
		entities,
		migrations: [process.cwd() + "/migrations/typeorm/*.{ts,js}"],
		migrationsTableName: "typeorm_migrations",
		synchronize: false,
		logging: false,
	});
}

let productionDataSource: DataSource | null = null;
let productionInitPromise: Promise<DataSource> | null = null;

export async function getDataSource(): Promise<DataSource> {
	// En desarrollo NO reutilizamos el DataSource global,
	// porque Next HMR recompila módulos y TypeORM se queda
	// con metadata de clases antiguas.
	if (process.env.NODE_ENV !== "production") {
		const ds = createDataSource();
		if (!ds.isInitialized) {
			await ds.initialize();
		}
		return ds;
	}

	// En producción sí usamos singleton
	if (productionDataSource?.isInitialized) {
		return productionDataSource;
	}

	if (!productionInitPromise) {
		productionDataSource = createDataSource();
		productionInitPromise = productionDataSource.initialize();
	}

	return productionInitPromise;
}
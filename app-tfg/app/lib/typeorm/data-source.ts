import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";

import { Role } from "./entities/Role";
import { UserStatus } from "./entities/UserStatus";
import { RequestStatus } from "./entities/RequestStatus";
import { RequestSourceType } from "./entities/RequestSourceType";
import { AccessEventType } from "./entities/AccessEventType";
import { AccessResultType } from "./entities/AccessResultType";
import { UserAdminActionType } from "./entities/UserAdminActionType";
import { User } from "./entities/User";
import { UserRequest } from "./entities/UserRequest";
import { UserManagementLog } from "./entities/UserManagementLog";
import { UserAccessLog } from "./entities/UserAccessLog";

export const typeormEntities = {
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
};

const entities = Object.values(typeormEntities);

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

declare global {
	// eslint-disable-next-line no-var
	var __typeormDataSource: DataSource | undefined;
	// eslint-disable-next-line no-var
	var __typeormDataSourceInitPromise: Promise<DataSource> | undefined;
}

export async function getDataSource(): Promise<DataSource> {
	if (!global.__typeormDataSource) {
		global.__typeormDataSource = createDataSource();
	}

	const ds = global.__typeormDataSource;

	if (!ds.isInitialized) {
		if (!global.__typeormDataSourceInitPromise) {
			global.__typeormDataSourceInitPromise = ds.initialize();
		}
		await global.__typeormDataSourceInitPromise;
	}

	return ds;
}

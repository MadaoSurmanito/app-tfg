import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";

import { Role } from "@/app/lib/typeorm/entities/Role";
import { UserStatus } from "@/app/lib/typeorm/entities/UserStatus";
import { RequestStatus } from "@/app/lib/typeorm/entities/RequestStatus";
import { RequestSourceType } from "@/app/lib/typeorm/entities/RequestSourceType";
import { AccessEventType } from "@/app/lib/typeorm/entities/AccessEventType";
import { AccessResultType } from "@/app/lib/typeorm/entities/AccessResultType";
import { UserAdminActionType } from "@/app/lib/typeorm/entities/UserAdminActionType";
import { User } from "@/app/lib/typeorm/entities/User";
import { UserRequest } from "@/app/lib/typeorm/entities/UserRequest";
import { UserManagementLog } from "@/app/lib/typeorm/entities/UserManagementLog";
import { UserAccessLog } from "@/app/lib/typeorm/entities/UserAccessLog";

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
	var __typeormDataSource: DataSource | undefined;
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

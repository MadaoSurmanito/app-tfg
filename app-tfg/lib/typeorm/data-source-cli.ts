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
import { CommercialVisitStatus } from "./entities/CommercialVisitStatus";
import { CommercialRouteStatus } from "./entities/CommercialRouteStatus";
import { Client } from "./entities/Client";
import { CommercialVisit } from "./entities/CommercialVisit";
import { CommercialRoute } from "./entities/CommercialRoute";
import { RouteVisit } from "./entities/RouteVisit";

export default new DataSource({
	type: "postgres",
	url: process.env.DATABASE_URL,
	entities: [
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
		CommercialVisitStatus,
		CommercialRouteStatus,
		Client,
		CommercialVisit,
		CommercialRoute,
		RouteVisit,
	],
	migrations: [process.cwd() + "/migrations/typeorm/*.{ts,js}"],
	migrationsTableName: "typeorm_migrations",
	synchronize: false,
	logging: false,
});

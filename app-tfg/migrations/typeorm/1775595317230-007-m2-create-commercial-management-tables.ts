import { MigrationInterface, QueryRunner } from "typeorm";

export class M2CreateCommercialManagementTables1775595317230 implements MigrationInterface {
	name = "M2CreateCommercialManagementTables1775595317230";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "clients" (
				"id" uuid NOT NULL DEFAULT gen_random_uuid(),
				"name" text NOT NULL,
				"contact_name" text,
				"tax_id" text,
				"address" text NOT NULL,
				"city" text NOT NULL,
				"postal_code" text,
				"province" text,
				"assigned_commercial_id" uuid NOT NULL,
				"linked_user_id" uuid NOT NULL,
				"notes" text,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
				"updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
				CONSTRAINT "UQ_clients_linked_user_id" UNIQUE ("linked_user_id"),
				CONSTRAINT "CHK_clients_updated_at_after_created" CHECK ("updated_at" >= "created_at"),
				CONSTRAINT "PK_clients" PRIMARY KEY ("id")
			)
		`);

		await queryRunner.query(`
			CREATE INDEX "clients_assigned_commercial_id_index"
			ON "clients" ("assigned_commercial_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "clients_linked_user_id_index"
			ON "clients" ("linked_user_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "clients_name_index"
			ON "clients" ("name")
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			ADD CONSTRAINT "FK_clients_assigned_commercial_id"
			FOREIGN KEY ("assigned_commercial_id")
			REFERENCES "users"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			ADD CONSTRAINT "FK_clients_linked_user_id"
			FOREIGN KEY ("linked_user_id")
			REFERENCES "users"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			CREATE TABLE "commercial_visits" (
				"id" uuid NOT NULL DEFAULT gen_random_uuid(),
				"client_id" uuid NOT NULL,
				"commercial_id" uuid NOT NULL,
				"scheduled_at" TIMESTAMP WITH TIME ZONE NOT NULL,
				"status_id" smallint NOT NULL,
				"notes" text,
				"result" text,
				CONSTRAINT "PK_commercial_visits" PRIMARY KEY ("id")
			)
		`);

		await queryRunner.query(`
			CREATE INDEX "commercial_visits_client_id_index"
			ON "commercial_visits" ("client_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "commercial_visits_commercial_id_index"
			ON "commercial_visits" ("commercial_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "commercial_visits_status_id_index"
			ON "commercial_visits" ("status_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "commercial_visits_scheduled_at_index"
			ON "commercial_visits" ("scheduled_at")
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_visits"
			ADD CONSTRAINT "FK_commercial_visits_client_id"
			FOREIGN KEY ("client_id")
			REFERENCES "clients"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_visits"
			ADD CONSTRAINT "FK_commercial_visits_commercial_id"
			FOREIGN KEY ("commercial_id")
			REFERENCES "users"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_visits"
			ADD CONSTRAINT "FK_commercial_visits_status_id"
			FOREIGN KEY ("status_id")
			REFERENCES "commercial_visit_statuses"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			CREATE TABLE "commercial_routes" (
				"id" uuid NOT NULL DEFAULT gen_random_uuid(),
				"commercial_id" uuid NOT NULL,
				"route_date" date NOT NULL,
				"name" text NOT NULL,
				"status_id" smallint NOT NULL,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
				CONSTRAINT "PK_commercial_routes" PRIMARY KEY ("id")
			)
		`);

		await queryRunner.query(`
			CREATE INDEX "commercial_routes_commercial_id_index"
			ON "commercial_routes" ("commercial_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "commercial_routes_route_date_index"
			ON "commercial_routes" ("route_date")
		`);

		await queryRunner.query(`
			CREATE INDEX "commercial_routes_status_id_index"
			ON "commercial_routes" ("status_id")
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_routes"
			ADD CONSTRAINT "FK_commercial_routes_commercial_id"
			FOREIGN KEY ("commercial_id")
			REFERENCES "users"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_routes"
			ADD CONSTRAINT "FK_commercial_routes_status_id"
			FOREIGN KEY ("status_id")
			REFERENCES "commercial_route_statuses"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			CREATE TABLE "route_visits" (
				"id" uuid NOT NULL DEFAULT gen_random_uuid(),
				"route_id" uuid NOT NULL,
				"visit_id" uuid NOT NULL,
				"visit_order" integer NOT NULL,
				CONSTRAINT "CHK_route_visits_visit_order_positive" CHECK ("visit_order" > 0),
				CONSTRAINT "PK_route_visits" PRIMARY KEY ("id")
			)
		`);

		await queryRunner.query(`
			CREATE INDEX "route_visits_route_id_index"
			ON "route_visits" ("route_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "route_visits_visit_id_index"
			ON "route_visits" ("visit_id")
		`);

		await queryRunner.query(`
			CREATE UNIQUE INDEX "route_visits_route_id_visit_id_unique"
			ON "route_visits" ("route_id", "visit_id")
		`);

		await queryRunner.query(`
			CREATE UNIQUE INDEX "route_visits_route_id_visit_order_unique"
			ON "route_visits" ("route_id", "visit_order")
		`);

		await queryRunner.query(`
			ALTER TABLE "route_visits"
			ADD CONSTRAINT "FK_route_visits_route_id"
			FOREIGN KEY ("route_id")
			REFERENCES "commercial_routes"("id")
			ON DELETE CASCADE
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "route_visits"
			ADD CONSTRAINT "FK_route_visits_visit_id"
			FOREIGN KEY ("visit_id")
			REFERENCES "commercial_visits"("id")
			ON DELETE CASCADE
			ON UPDATE CASCADE
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "route_visits" DROP CONSTRAINT "FK_route_visits_visit_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "route_visits" DROP CONSTRAINT "FK_route_visits_route_id"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."route_visits_route_id_visit_order_unique"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."route_visits_route_id_visit_id_unique"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."route_visits_visit_id_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."route_visits_route_id_index"
		`);

		await queryRunner.query(`
			DROP TABLE "route_visits"
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_routes" DROP CONSTRAINT "FK_commercial_routes_status_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_routes" DROP CONSTRAINT "FK_commercial_routes_commercial_id"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercial_routes_status_id_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercial_routes_route_date_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercial_routes_commercial_id_index"
		`);

		await queryRunner.query(`
			DROP TABLE "commercial_routes"
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_visits" DROP CONSTRAINT "FK_commercial_visits_status_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_visits" DROP CONSTRAINT "FK_commercial_visits_commercial_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "commercial_visits" DROP CONSTRAINT "FK_commercial_visits_client_id"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercial_visits_scheduled_at_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercial_visits_status_id_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercial_visits_commercial_id_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercial_visits_client_id_index"
		`);

		await queryRunner.query(`
			DROP TABLE "commercial_visits"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients" DROP CONSTRAINT "FK_clients_linked_user_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients" DROP CONSTRAINT "FK_clients_assigned_commercial_id"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."clients_name_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."clients_linked_user_id_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."clients_assigned_commercial_id_index"
		`);

		await queryRunner.query(`
			DROP TABLE "clients"
		`);
	}
}

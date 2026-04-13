import { MigrationInterface, QueryRunner } from "typeorm";

export class M2CreateClientCommercialAssignments1776095423325 implements MigrationInterface {
	name = "M2CreateClientCommercialAssignments1776095423325";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "client_commercial_assignments" (
				"id" uuid NOT NULL DEFAULT gen_random_uuid(),
				"client_id" uuid NOT NULL,
				"commercial_id" uuid NOT NULL,
				"assigned_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
				"unassigned_at" TIMESTAMPTZ,
				"assigned_by_user_id" uuid,
				"unassigned_by_user_id" uuid,
				"notes" text,
				CONSTRAINT "PK_client_commercial_assignments_id" PRIMARY KEY ("id"),
				CONSTRAINT "CHK_client_commercial_assignments_unassigned_after_assigned"
					CHECK ("unassigned_at" IS NULL OR "unassigned_at" >= "assigned_at")
			)
		`);

		await queryRunner.query(`
			CREATE INDEX "client_commercial_assignments_client_id_index"
			ON "client_commercial_assignments" ("client_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "client_commercial_assignments_commercial_id_index"
			ON "client_commercial_assignments" ("commercial_id")
		`);

		await queryRunner.query(`
			CREATE INDEX "client_commercial_assignments_assigned_at_index"
			ON "client_commercial_assignments" ("assigned_at")
		`);

		await queryRunner.query(`
			CREATE INDEX "client_commercial_assignments_unassigned_at_index"
			ON "client_commercial_assignments" ("unassigned_at")
		`);

		await queryRunner.query(`
			CREATE UNIQUE INDEX "client_commercial_assignments_active_client_unique"
			ON "client_commercial_assignments" ("client_id")
			WHERE "unassigned_at" IS NULL
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			ADD CONSTRAINT "FK_client_commercial_assignments_client_id"
			FOREIGN KEY ("client_id")
			REFERENCES "clients"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			ADD CONSTRAINT "FK_client_commercial_assignments_commercial_id"
			FOREIGN KEY ("commercial_id")
			REFERENCES "commercials"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			ADD CONSTRAINT "FK_client_commercial_assignments_assigned_by_user_id"
			FOREIGN KEY ("assigned_by_user_id")
			REFERENCES "users"("id")
			ON DELETE SET NULL
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			ADD CONSTRAINT "FK_client_commercial_assignments_unassigned_by_user_id"
			FOREIGN KEY ("unassigned_by_user_id")
			REFERENCES "users"("id")
			ON DELETE SET NULL
			ON UPDATE CASCADE
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			DROP CONSTRAINT "FK_client_commercial_assignments_unassigned_by_user_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			DROP CONSTRAINT "FK_client_commercial_assignments_assigned_by_user_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			DROP CONSTRAINT "FK_client_commercial_assignments_commercial_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			DROP CONSTRAINT "FK_client_commercial_assignments_client_id"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."client_commercial_assignments_active_client_unique"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."client_commercial_assignments_unassigned_at_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."client_commercial_assignments_assigned_at_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."client_commercial_assignments_commercial_id_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."client_commercial_assignments_client_id_index"
		`);

		await queryRunner.query(`
			DROP TABLE "client_commercial_assignments"
		`);
	}
}
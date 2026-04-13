import { MigrationInterface, QueryRunner } from "typeorm";

export class M2CreateCommercials1776095421990 implements MigrationInterface {
	name = "M2CreateCommercials1776095421990";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "commercials" (
				"id" uuid NOT NULL,
				"employee_code" text,
				"territory" text,
				"notes" text,
				"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
				"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
				CONSTRAINT "PK_commercials_id" PRIMARY KEY ("id")
			)
		`);

		await queryRunner.query(`
			CREATE INDEX "commercials_employee_code_index"
			ON "commercials" ("employee_code")
		`);

		await queryRunner.query(`
			CREATE INDEX "commercials_territory_index"
			ON "commercials" ("territory")
		`);

		await queryRunner.query(`
			ALTER TABLE "commercials"
			ADD CONSTRAINT "FK_commercials_id_users"
			FOREIGN KEY ("id")
			REFERENCES "users"("id")
			ON DELETE CASCADE
			ON UPDATE CASCADE
		`);

		// Backfill inicial: crear perfil comercial para todos los users con role_id = 2
		await queryRunner.query(`
			INSERT INTO "commercials" ("id")
			SELECT "id"
			FROM "users"
			WHERE "role_id" = 2
			ON CONFLICT ("id") DO NOTHING
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			ALTER TABLE "commercials"
			DROP CONSTRAINT "FK_commercials_id_users"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercials_territory_index"
		`);

		await queryRunner.query(`
			DROP INDEX "public"."commercials_employee_code_index"
		`);

		await queryRunner.query(`
			DROP TABLE "commercials"
		`);
	}
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class M2CreateLookupTables1775595315156 implements MigrationInterface {
	name = "M2CreateLookupTables1775595315156";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "commercial_visit_statuses" (
				"id" smallint NOT NULL,
				"code" text NOT NULL,
				"name" text NOT NULL,
				CONSTRAINT "UQ_commercial_visit_statuses_code" UNIQUE ("code"),
				CONSTRAINT "UQ_commercial_visit_statuses_name" UNIQUE ("name"),
				CONSTRAINT "PK_commercial_visit_statuses" PRIMARY KEY ("id")
			)
		`);

		await queryRunner.query(`
			CREATE TABLE "commercial_route_statuses" (
				"id" smallint NOT NULL,
				"code" text NOT NULL,
				"name" text NOT NULL,
				CONSTRAINT "UQ_commercial_route_statuses_code" UNIQUE ("code"),
				CONSTRAINT "UQ_commercial_route_statuses_name" UNIQUE ("name"),
				CONSTRAINT "PK_commercial_route_statuses" PRIMARY KEY ("id")
			)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "commercial_route_statuses"`);
		await queryRunner.query(`DROP TABLE "commercial_visit_statuses"`);
	}
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class M2SeedLookupData1775595322515 implements MigrationInterface {
	name = "M2SeedLookupData1775595322515";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			INSERT INTO "commercial_visit_statuses" ("id", "code", "name")
			VALUES
				(1, 'planned', 'Planificada'),
				(2, 'completed', 'Realizada'),
				(3, 'cancelled', 'Cancelada')
		`);

		await queryRunner.query(`
			INSERT INTO "commercial_route_statuses" ("id", "code", "name")
			VALUES
				(1, 'planned', 'Planificada'),
				(2, 'in_progress', 'En curso'),
				(3, 'completed', 'Completada'),
				(4, 'cancelled', 'Cancelada')
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DELETE FROM "commercial_route_statuses"`);
		await queryRunner.query(`DELETE FROM "commercial_visit_statuses"`);
	}
}

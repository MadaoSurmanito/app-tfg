import { MigrationInterface, QueryRunner } from "typeorm";

export class M2UseUserIdAsClientId1776264811678 implements MigrationInterface {
	name = "M2UseUserIdAsClientId1776264811678";

	public async up(queryRunner: QueryRunner): Promise<void> {
		// ----------------------------------------------------------------------
		// Tabla temporal nueva con el esquema objetivo:
		// clients.id = PK compartida con users.id
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			CREATE TABLE "clients_new" (
				"id" uuid NOT NULL,
				"name" text NOT NULL,
				"contact_name" text,
				"tax_id" text,
				"address" text NOT NULL,
				"city" text NOT NULL,
				"postal_code" text,
				"province" text,
				"notes" text,
				"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
				"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
				CONSTRAINT "PK_clients_new_id" PRIMARY KEY ("id"),
				CONSTRAINT "CHK_clients_new_updated_at_after_created"
					CHECK ("updated_at" >= "created_at")
			)
		`);

		await queryRunner.query(`
			CREATE INDEX "clients_new_name_index"
			ON "clients_new" ("name")
		`);

		await queryRunner.query(`
			ALTER TABLE "clients_new"
			ADD CONSTRAINT "FK_clients_new_id_users"
			FOREIGN KEY ("id")
			REFERENCES "users"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		// ----------------------------------------------------------------------
		// Mapa temporal old_client_id -> new_client_id (= linked_user_id)
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			CREATE TABLE "__tmp_client_id_mapping" (
				"old_id" uuid NOT NULL,
				"new_id" uuid NOT NULL,
				CONSTRAINT "PK___tmp_client_id_mapping_old_id" PRIMARY KEY ("old_id"),
				CONSTRAINT "UQ___tmp_client_id_mapping_new_id" UNIQUE ("new_id")
			)
		`);

		await queryRunner.query(`
			INSERT INTO "__tmp_client_id_mapping" ("old_id", "new_id")
			SELECT "id", "linked_user_id"
			FROM "clients"
		`);

		// ----------------------------------------------------------------------
		// Copiamos clientes al nuevo esquema usando linked_user_id como PK final
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			INSERT INTO "clients_new" (
				"id",
				"name",
				"contact_name",
				"tax_id",
				"address",
				"city",
				"postal_code",
				"province",
				"notes",
				"created_at",
				"updated_at"
			)
			SELECT
				"linked_user_id",
				"name",
				"contact_name",
				"tax_id",
				"address",
				"city",
				"postal_code",
				"province",
				"notes",
				"created_at",
				"updated_at"
			FROM "clients"
		`);

		// ----------------------------------------------------------------------
		// Soltamos FKs hijas antes de remapear IDs
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			ALTER TABLE "commercial_visits"
			DROP CONSTRAINT "FK_commercial_visits_client_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			DROP CONSTRAINT "FK_client_commercial_assignments_client_id"
		`);

		// ----------------------------------------------------------------------
		// Remapeo de las tablas hijas al nuevo client_id
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			UPDATE "commercial_visits" cv
			SET "client_id" = map."new_id"
			FROM "__tmp_client_id_mapping" map
			WHERE cv."client_id" = map."old_id"
		`);

		await queryRunner.query(`
			UPDATE "client_commercial_assignments" cca
			SET "client_id" = map."new_id"
			FROM "__tmp_client_id_mapping" map
			WHERE cca."client_id" = map."old_id"
		`);

		// ----------------------------------------------------------------------
		// Eliminamos la tabla vieja y dejamos la nueva con el nombre final
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			DROP TABLE "clients"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients_new" RENAME TO "clients"
		`);

		await queryRunner.query(`
			ALTER INDEX "clients_new_name_index"
			RENAME TO "clients_name_index"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			RENAME CONSTRAINT "PK_clients_new_id" TO "PK_clients"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			RENAME CONSTRAINT "CHK_clients_new_updated_at_after_created"
			TO "CHK_clients_updated_at_after_created"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			RENAME CONSTRAINT "FK_clients_new_id_users"
			TO "FK_clients_id_users"
		`);

		// ----------------------------------------------------------------------
		// Recreamos FKs hijas apuntando a clients.id
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			ALTER TABLE "commercial_visits"
			ADD CONSTRAINT "FK_commercial_visits_client_id"
			FOREIGN KEY ("client_id")
			REFERENCES "clients"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			ADD CONSTRAINT "FK_client_commercial_assignments_client_id"
			FOREIGN KEY ("client_id")
			REFERENCES "clients"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		// ----------------------------------------------------------------------
		// Limpieza
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			DROP TABLE "__tmp_client_id_mapping"
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// ----------------------------------------------------------------------
		// Reconstrucción del esquema anterior:
		// clients.id UUID propio
		// clients.linked_user_id UUID único -> users.id
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			CREATE TABLE "clients_old" (
				"id" uuid NOT NULL,
				"name" text NOT NULL,
				"contact_name" text,
				"tax_id" text,
				"address" text NOT NULL,
				"city" text NOT NULL,
				"postal_code" text,
				"province" text,
				"linked_user_id" uuid NOT NULL,
				"notes" text,
				"created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
				"updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
				CONSTRAINT "PK_clients_old_id" PRIMARY KEY ("id"),
				CONSTRAINT "UQ_clients_old_linked_user_id" UNIQUE ("linked_user_id"),
				CONSTRAINT "CHK_clients_old_updated_at_after_created"
					CHECK ("updated_at" >= "created_at")
			)
		`);

		await queryRunner.query(`
			CREATE INDEX "clients_old_name_index"
			ON "clients_old" ("name")
		`);

		await queryRunner.query(`
			CREATE INDEX "clients_old_linked_user_id_index"
			ON "clients_old" ("linked_user_id")
		`);

		await queryRunner.query(`
			ALTER TABLE "clients_old"
			ADD CONSTRAINT "FK_clients_old_linked_user_id"
			FOREIGN KEY ("linked_user_id")
			REFERENCES "users"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		// ----------------------------------------------------------------------
		// Mapa temporal current_client_id -> restored_client_id
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			CREATE TABLE "__tmp_client_id_mapping" (
				"old_id" uuid NOT NULL,
				"new_id" uuid NOT NULL,
				CONSTRAINT "PK___tmp_client_id_mapping_old_id" PRIMARY KEY ("old_id"),
				CONSTRAINT "UQ___tmp_client_id_mapping_new_id" UNIQUE ("new_id")
			)
		`);

		await queryRunner.query(`
			INSERT INTO "__tmp_client_id_mapping" ("old_id", "new_id")
			SELECT "id", gen_random_uuid()
			FROM "clients"
		`);

		// ----------------------------------------------------------------------
		// Copiamos de vuelta al esquema anterior
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			INSERT INTO "clients_old" (
				"id",
				"name",
				"contact_name",
				"tax_id",
				"address",
				"city",
				"postal_code",
				"province",
				"linked_user_id",
				"notes",
				"created_at",
				"updated_at"
			)
			SELECT
				map."new_id",
				c."name",
				c."contact_name",
				c."tax_id",
				c."address",
				c."city",
				c."postal_code",
				c."province",
				c."id",
				c."notes",
				c."created_at",
				c."updated_at"
			FROM "clients" c
			INNER JOIN "__tmp_client_id_mapping" map
				ON map."old_id" = c."id"
		`);

		// ----------------------------------------------------------------------
		// Soltamos FKs hijas antes de remapear IDs
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			ALTER TABLE "commercial_visits"
			DROP CONSTRAINT "FK_commercial_visits_client_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			DROP CONSTRAINT "FK_client_commercial_assignments_client_id"
		`);

		// ----------------------------------------------------------------------
		// Remapeo de tablas hijas al ID restaurado
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			UPDATE "commercial_visits" cv
			SET "client_id" = map."new_id"
			FROM "__tmp_client_id_mapping" map
			WHERE cv."client_id" = map."old_id"
		`);

		await queryRunner.query(`
			UPDATE "client_commercial_assignments" cca
			SET "client_id" = map."new_id"
			FROM "__tmp_client_id_mapping" map
			WHERE cca."client_id" = map."old_id"
		`);

		// ----------------------------------------------------------------------
		// Eliminamos la tabla actual y restauramos la antigua
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			DROP TABLE "clients"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients_old" RENAME TO "clients"
		`);

		await queryRunner.query(`
			ALTER INDEX "clients_old_name_index"
			RENAME TO "clients_name_index"
		`);

		await queryRunner.query(`
			ALTER INDEX "clients_old_linked_user_id_index"
			RENAME TO "clients_linked_user_id_index"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			RENAME CONSTRAINT "PK_clients_old_id" TO "PK_clients"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			RENAME CONSTRAINT "UQ_clients_old_linked_user_id"
			TO "UQ_clients_linked_user_id"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			RENAME CONSTRAINT "CHK_clients_old_updated_at_after_created"
			TO "CHK_clients_updated_at_after_created"
		`);

		await queryRunner.query(`
			ALTER TABLE "clients"
			RENAME CONSTRAINT "FK_clients_old_linked_user_id"
			TO "FK_clients_linked_user_id"
		`);

		// ----------------------------------------------------------------------
		// Recreamos FKs hijas
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			ALTER TABLE "commercial_visits"
			ADD CONSTRAINT "FK_commercial_visits_client_id"
			FOREIGN KEY ("client_id")
			REFERENCES "clients"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		await queryRunner.query(`
			ALTER TABLE "client_commercial_assignments"
			ADD CONSTRAINT "FK_client_commercial_assignments_client_id"
			FOREIGN KEY ("client_id")
			REFERENCES "clients"("id")
			ON DELETE RESTRICT
			ON UPDATE CASCADE
		`);

		// ----------------------------------------------------------------------
		// Limpieza
		// ----------------------------------------------------------------------
		await queryRunner.query(`
			DROP TABLE "__tmp_client_id_mapping"
		`);
	}
}
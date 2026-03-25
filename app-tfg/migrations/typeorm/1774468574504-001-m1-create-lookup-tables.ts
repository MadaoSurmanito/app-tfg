import { MigrationInterface } from "typeorm";
import { QueryRunner } from "typeorm";

export class M1CreateLookupTables1774500000001 implements MigrationInterface {
	name = "M1CreateLookupTables1774500000001";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public`);
		await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public`);
		await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public`);

		await queryRunner.query(`
			CREATE TABLE public.access_event_types (
				id SMALLINT NOT NULL,
				code TEXT NOT NULL,
				name TEXT NOT NULL,
				CONSTRAINT access_event_types_pkey PRIMARY KEY (id),
				CONSTRAINT access_event_types_code_key UNIQUE (code),
				CONSTRAINT access_event_types_name_key UNIQUE (name)
			)
		`);

		await queryRunner.query(`
			CREATE TABLE public.access_result_types (
				id SMALLINT NOT NULL,
				code TEXT NOT NULL,
				name TEXT NOT NULL,
				CONSTRAINT access_result_types_pkey PRIMARY KEY (id),
				CONSTRAINT access_result_types_code_key UNIQUE (code),
				CONSTRAINT access_result_types_name_key UNIQUE (name)
			)
		`);

		await queryRunner.query(`
			CREATE TABLE public.request_source_types (
				id SMALLINT NOT NULL,
				code TEXT NOT NULL,
				name TEXT NOT NULL,
				CONSTRAINT request_source_types_pkey PRIMARY KEY (id),
				CONSTRAINT request_source_types_code_key UNIQUE (code),
				CONSTRAINT request_source_types_name_key UNIQUE (name)
			)
		`);

		await queryRunner.query(`
			CREATE TABLE public.request_statuses (
				id SMALLINT NOT NULL,
				code TEXT NOT NULL,
				name TEXT NOT NULL,
				CONSTRAINT request_statuses_pkey PRIMARY KEY (id),
				CONSTRAINT request_statuses_code_key UNIQUE (code),
				CONSTRAINT request_statuses_name_key UNIQUE (name)
			)
		`);

		await queryRunner.query(`
			CREATE TABLE public.roles (
				id SMALLINT NOT NULL,
				code TEXT NOT NULL,
				name TEXT NOT NULL,
				description TEXT,
				CONSTRAINT roles_pkey PRIMARY KEY (id),
				CONSTRAINT roles_code_key UNIQUE (code),
				CONSTRAINT roles_name_key UNIQUE (name)
			)
		`);

		await queryRunner.query(`
			CREATE TABLE public.user_admin_action_types (
				id SMALLINT NOT NULL,
				code TEXT NOT NULL,
				name TEXT NOT NULL,
				CONSTRAINT user_admin_action_types_pkey PRIMARY KEY (id),
				CONSTRAINT user_admin_action_types_code_key UNIQUE (code),
				CONSTRAINT user_admin_action_types_name_key UNIQUE (name)
			)
		`);

		await queryRunner.query(`
			CREATE TABLE public.user_statuses (
				id SMALLINT NOT NULL,
				code TEXT NOT NULL,
				name TEXT NOT NULL,
				CONSTRAINT user_statuses_pkey PRIMARY KEY (id),
				CONSTRAINT user_statuses_code_key UNIQUE (code),
				CONSTRAINT user_statuses_name_key UNIQUE (name)
			)
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS public.user_statuses`);
		await queryRunner.query(`DROP TABLE IF EXISTS public.user_admin_action_types`);
		await queryRunner.query(`DROP TABLE IF EXISTS public.roles`);
		await queryRunner.query(`DROP TABLE IF EXISTS public.request_statuses`);
		await queryRunner.query(`DROP TABLE IF EXISTS public.request_source_types`);
		await queryRunner.query(`DROP TABLE IF EXISTS public.access_result_types`);
		await queryRunner.query(`DROP TABLE IF EXISTS public.access_event_types`);
	}
}
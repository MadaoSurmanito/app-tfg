import { MigrationInterface } from "typeorm";
import { QueryRunner } from "typeorm";

export class M1CreateUsersAndRequests1774500000002 implements MigrationInterface {
	name = "M1CreateUsersAndRequests1774500000002";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE public.users (
				id UUID DEFAULT gen_random_uuid() NOT NULL,
				email public.citext NOT NULL,
				password_hash TEXT NOT NULL,
				name TEXT NOT NULL,
				phone TEXT,
				company TEXT,
				role_id SMALLINT NOT NULL,
				status_id SMALLINT NOT NULL,
				profile_image_url TEXT,
				last_login_at TIMESTAMPTZ,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				CONSTRAINT users_pkey PRIMARY KEY (id),
				CONSTRAINT users_email_key UNIQUE (email),
				CONSTRAINT chk_users_last_login_after_created CHECK (
					(last_login_at IS NULL) OR (last_login_at >= created_at)
				),
				CONSTRAINT chk_users_updated_at_after_created CHECK (
					updated_at >= created_at
				)
			)
		`);

		await queryRunner.query(`
			CREATE INDEX users_role_id_index ON public.users USING btree (role_id)
		`);

		await queryRunner.query(`
			CREATE INDEX users_status_id_index ON public.users USING btree (status_id)
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.users
			ADD CONSTRAINT users_role_id_fkey
			FOREIGN KEY (role_id)
			REFERENCES public.roles(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.users
			ADD CONSTRAINT users_status_id_fkey
			FOREIGN KEY (status_id)
			REFERENCES public.user_statuses(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			CREATE TABLE public.user_requests (
				id UUID DEFAULT gen_random_uuid() NOT NULL,
				email public.citext NOT NULL,
				password_hash TEXT NOT NULL,
				name TEXT NOT NULL,
				phone TEXT,
				company TEXT,
				requested_role_id SMALLINT NOT NULL,
				status_id SMALLINT NOT NULL,
				request_source_type_id SMALLINT NOT NULL,
				requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				reviewed_at TIMESTAMPTZ,
				reviewed_by UUID,
				rejection_reason TEXT,
				created_user_id UUID,
				CONSTRAINT user_requests_pkey PRIMARY KEY (id),
				CONSTRAINT chk_user_requests_reviewed_at_after_requested_at CHECK (
					(reviewed_at IS NULL) OR (reviewed_at >= requested_at)
				)
			)
		`);

		await queryRunner.query(`
			CREATE INDEX user_requests_email_index ON public.user_requests USING btree (email)
		`);

		await queryRunner.query(`
			CREATE INDEX user_requests_request_source_type_id_index
			ON public.user_requests USING btree (request_source_type_id)
		`);

		await queryRunner.query(`
			CREATE INDEX user_requests_requested_role_id_index
			ON public.user_requests USING btree (requested_role_id)
		`);

		await queryRunner.query(`
			CREATE INDEX user_requests_reviewed_by_index
			ON public.user_requests USING btree (reviewed_by)
		`);

		await queryRunner.query(`
			CREATE INDEX user_requests_status_id_index
			ON public.user_requests USING btree (status_id)
		`);

		await queryRunner.query(`
			CREATE INDEX user_requests_created_user_id_index
			ON public.user_requests USING btree (created_user_id)
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_requests
			ADD CONSTRAINT user_requests_request_source_type_id_fkey
			FOREIGN KEY (request_source_type_id)
			REFERENCES public.request_source_types(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_requests
			ADD CONSTRAINT user_requests_requested_role_id_fkey
			FOREIGN KEY (requested_role_id)
			REFERENCES public.roles(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_requests
			ADD CONSTRAINT user_requests_reviewed_by_fkey
			FOREIGN KEY (reviewed_by)
			REFERENCES public.users(id)
			ON UPDATE CASCADE
			ON DELETE SET NULL
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_requests
			ADD CONSTRAINT user_requests_status_id_fkey
			FOREIGN KEY (status_id)
			REFERENCES public.request_statuses(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_requests
			ADD CONSTRAINT user_requests_created_user_id_fkey
			FOREIGN KEY (created_user_id)
			REFERENCES public.users(id)
			ON UPDATE CASCADE
			ON DELETE SET NULL
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS public.user_requests`);
		await queryRunner.query(`DROP TABLE IF EXISTS public.users`);
	}
}

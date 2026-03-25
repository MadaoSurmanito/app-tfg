import { MigrationInterface } from "typeorm";
import { QueryRunner } from "typeorm";

export class M1CreateAuditTables1774500000003 implements MigrationInterface {
	name = "M1CreateAuditTables1774500000003";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE public.user_management_log (
				target_user_id UUID NOT NULL,
				performed_by UUID NOT NULL,
				action_type_id SMALLINT NOT NULL,
				previous_status_id SMALLINT,
				new_status_id SMALLINT,
				previous_role_id SMALLINT,
				new_role_id SMALLINT,
				reason TEXT,
				notes TEXT,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				id BIGSERIAL NOT NULL,
				CONSTRAINT user_management_log_pkey PRIMARY KEY (id)
			)
		`);

		await queryRunner.query(`
			CREATE INDEX user_management_log_action_type_id_index
			ON public.user_management_log USING btree (action_type_id)
		`);

		await queryRunner.query(`
			CREATE INDEX user_management_log_created_at_index
			ON public.user_management_log USING btree (created_at)
		`);

		await queryRunner.query(`
			CREATE INDEX user_management_log_performed_by_index
			ON public.user_management_log USING btree (performed_by)
		`);

		await queryRunner.query(`
			CREATE INDEX user_management_log_target_user_id_index
			ON public.user_management_log USING btree (target_user_id)
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_management_log
			ADD CONSTRAINT user_management_log_action_type_id_fkey
			FOREIGN KEY (action_type_id)
			REFERENCES public.user_admin_action_types(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_management_log
			ADD CONSTRAINT user_management_log_new_role_id_fkey
			FOREIGN KEY (new_role_id)
			REFERENCES public.roles(id)
			ON UPDATE CASCADE
			ON DELETE SET NULL
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_management_log
			ADD CONSTRAINT user_management_log_new_status_id_fkey
			FOREIGN KEY (new_status_id)
			REFERENCES public.user_statuses(id)
			ON UPDATE CASCADE
			ON DELETE SET NULL
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_management_log
			ADD CONSTRAINT user_management_log_performed_by_fkey
			FOREIGN KEY (performed_by)
			REFERENCES public.users(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_management_log
			ADD CONSTRAINT user_management_log_previous_role_id_fkey
			FOREIGN KEY (previous_role_id)
			REFERENCES public.roles(id)
			ON UPDATE CASCADE
			ON DELETE SET NULL
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_management_log
			ADD CONSTRAINT user_management_log_previous_status_id_fkey
			FOREIGN KEY (previous_status_id)
			REFERENCES public.user_statuses(id)
			ON UPDATE CASCADE
			ON DELETE SET NULL
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_management_log
			ADD CONSTRAINT user_management_log_target_user_id_fkey
			FOREIGN KEY (target_user_id)
			REFERENCES public.users(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			CREATE TABLE public.user_access_log (
				user_id UUID,
				email_attempted public.citext,
				event_type_id SMALLINT NOT NULL,
				result_type_id SMALLINT NOT NULL,
				failure_reason TEXT,
				session_token TEXT,
				ip_address INET,
				user_agent TEXT,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				revoked_at TIMESTAMPTZ,
				expires_at TIMESTAMPTZ,
				id BIGSERIAL NOT NULL,
				CONSTRAINT user_access_log_pkey PRIMARY KEY (id),
				CONSTRAINT chk_user_access_log_expires_after_created CHECK (
					(expires_at IS NULL) OR (expires_at > created_at)
				),
				CONSTRAINT chk_user_access_log_revoked_after_created CHECK (
					(revoked_at IS NULL) OR (revoked_at >= created_at)
				),
				CONSTRAINT chk_user_access_log_user_or_email_present CHECK (
					(user_id IS NOT NULL) OR (email_attempted IS NOT NULL)
				)
			)
		`);

		await queryRunner.query(`
			CREATE INDEX user_access_log_created_at_index
			ON public.user_access_log USING btree (created_at)
		`);

		await queryRunner.query(`
			CREATE INDEX user_access_log_email_attempted_index
			ON public.user_access_log USING btree (email_attempted)
		`);

		await queryRunner.query(`
			CREATE INDEX user_access_log_event_type_id_index
			ON public.user_access_log USING btree (event_type_id)
		`);

		await queryRunner.query(`
			CREATE INDEX user_access_log_result_type_id_index
			ON public.user_access_log USING btree (result_type_id)
		`);

		await queryRunner.query(`
			CREATE INDEX user_access_log_session_token_index
			ON public.user_access_log USING btree (session_token)
		`);

		await queryRunner.query(`
			CREATE INDEX user_access_log_user_id_index
			ON public.user_access_log USING btree (user_id)
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_access_log
			ADD CONSTRAINT user_access_log_event_type_id_fkey
			FOREIGN KEY (event_type_id)
			REFERENCES public.access_event_types(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_access_log
			ADD CONSTRAINT user_access_log_result_type_id_fkey
			FOREIGN KEY (result_type_id)
			REFERENCES public.access_result_types(id)
			ON UPDATE CASCADE
			ON DELETE RESTRICT
		`);

		await queryRunner.query(`
			ALTER TABLE ONLY public.user_access_log
			ADD CONSTRAINT user_access_log_user_id_fkey
			FOREIGN KEY (user_id)
			REFERENCES public.users(id)
			ON UPDATE CASCADE
			ON DELETE SET NULL
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE IF EXISTS public.user_access_log`);
		await queryRunner.query(`DROP TABLE IF EXISTS public.user_management_log`);
	}
}

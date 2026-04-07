import { MigrationInterface } from "typeorm";
import { QueryRunner } from "typeorm";

export class M1SeedLookupData1774468579452 implements MigrationInterface {
	name = "M1SeedLookupData1774468579452";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			INSERT INTO public.access_event_types (id, code, name)
			VALUES
				(1, 'login_attempt', 'Intento de inicio de sesión'),
				(2, 'login_success', 'Inicio de sesión correcto'),
				(3, 'login_failed', 'Inicio de sesión fallido'),
				(4, 'logout', 'Cierre de sesión'),
				(5, 'session_revoked', 'Sesión revocada'),
				(6, 'session_expired', 'Sesión expirada')
			ON CONFLICT (id) DO NOTHING
		`);

		await queryRunner.query(`
			INSERT INTO public.access_result_types (id, code, name)
			VALUES
				(1, 'success', 'Éxito'),
				(2, 'failed', 'Fallido'),
				(3, 'revoked', 'Revocado'),
				(4, 'expired', 'Expirado')
			ON CONFLICT (id) DO NOTHING
		`);

		await queryRunner.query(`
			INSERT INTO public.request_source_types (id, code, name)
			VALUES
				(1, 'self_registration', 'Autoregistro'),
				(2, 'admin_created', 'Creada por administrador'),
				(3, 'commercial_created', 'Creada por comercial')
			ON CONFLICT (id) DO NOTHING
		`);

		await queryRunner.query(`
			INSERT INTO public.request_statuses (id, code, name)
			VALUES
				(1, 'pending', 'Pendiente'),
				(2, 'approved', 'Aprobada'),
				(3, 'rejected', 'Rechazada')
			ON CONFLICT (id) DO NOTHING
		`);

		await queryRunner.query(`
			INSERT INTO public.roles (id, code, name, description)
			VALUES
				(1, 'admin', 'Administrador', 'Acceso completo al sistema'),
				(2, 'commercial', 'Comercial', 'Gestión comercial y operativa'),
				(3, 'client', 'Cliente', 'Acceso restringido para clientes')
			ON CONFLICT (id) DO NOTHING
		`);

		await queryRunner.query(`
			INSERT INTO public.user_admin_action_types (id, code, name)
			VALUES
				(1, 'status_change', 'Cambio de estado'),
				(2, 'role_change', 'Cambio de rol'),
				(3, 'user_created', 'Usuario creado'),
				(4, 'user_approved', 'Usuario aprobado'),
				(5, 'user_rejected', 'Usuario rechazado'),
				(6, 'password_reset', 'Restablecimiento de contraseña'),
				(7, 'deactivate_user', 'Desactivar usuario')
			ON CONFLICT (id) DO NOTHING
		`);

		await queryRunner.query(`
			INSERT INTO public.user_statuses (id, code, name)
			VALUES
				(1, 'active', 'Activo'),
				(2, 'inactive', 'Inactivo'),
				(3, 'blocked', 'Bloqueado')
			ON CONFLICT (id) DO NOTHING
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			DELETE FROM public.user_statuses
			WHERE id IN (1, 2, 3)
		`);

		await queryRunner.query(`
			DELETE FROM public.user_admin_action_types
			WHERE id IN (1, 2, 3, 4, 5, 6, 7)
		`);

		await queryRunner.query(`
			DELETE FROM public.roles
			WHERE id IN (1, 2, 3)
		`);

		await queryRunner.query(`
			DELETE FROM public.request_statuses
			WHERE id IN (1, 2, 3)
		`);

		await queryRunner.query(`
			DELETE FROM public.request_source_types
			WHERE id IN (1, 2, 3)
		`);

		await queryRunner.query(`
			DELETE FROM public.access_result_types
			WHERE id IN (1, 2, 3, 4)
		`);

		await queryRunner.query(`
			DELETE FROM public.access_event_types
			WHERE id IN (1, 2, 3, 4, 5, 6)
		`);
	}
}

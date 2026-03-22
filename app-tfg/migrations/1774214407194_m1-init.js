/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // Extensiones
    pgm.createExtension("citext", { ifNotExists: true });
    pgm.createExtension("pgcrypto", { ifNotExists: true });

    // CATÁLOGOS

    pgm.createTable("roles", {
        id: {
            type: "smallint",
            primaryKey: true,
        },
        code: {
            type: "text",
            notNull: true,
            unique: true,
        },
        name: {
            type: "text",
            notNull: true,
            unique: true,
        },
        description: {
            type: "text",
        },
    });

    pgm.createTable("user_statuses", {
        id: {
            type: "smallint",
            primaryKey: true,
        },
        code: {
            type: "text",
            notNull: true,
            unique: true,
        },
        name: {
            type: "text",
            notNull: true,
            unique: true,
        },
    });

    pgm.createTable("request_statuses", {
        id: {
            type: "smallint",
            primaryKey: true,
        },
        code: {
            type: "text",
            notNull: true,
            unique: true,
        },
        name: {
            type: "text",
            notNull: true,
            unique: true,
        },
    });

    pgm.createTable("request_source_types", {
        id: {
            type: "smallint",
            primaryKey: true,
        },
        code: {
            type: "text",
            notNull: true,
            unique: true,
        },
        name: {
            type: "text",
            notNull: true,
            unique: true,
        },
    });

    pgm.createTable("access_event_types", {
        id: {
            type: "smallint",
            primaryKey: true,
        },
        code: {
            type: "text",
            notNull: true,
            unique: true,
        },
        name: {
            type: "text",
            notNull: true,
            unique: true,
        },
    });

    pgm.createTable("access_result_types", {
        id: {
            type: "smallint",
            primaryKey: true,
        },
        code: {
            type: "text",
            notNull: true,
            unique: true,
        },
        name: {
            type: "text",
            notNull: true,
            unique: true,
        },
    });

    pgm.createTable("user_admin_action_types", {
        id: {
            type: "smallint",
            primaryKey: true,
        },
        code: {
            type: "text",
            notNull: true,
            unique: true,
        },
        name: {
            type: "text",
            notNull: true,
            unique: true,
        },
    });

    // TABLAS PRINCIPALES

    pgm.createTable("users", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        email: {
            type: "citext",
            notNull: true,
            unique: true,
        },
        password_hash: {
            type: "text",
            notNull: true,
        },
        name: {
            type: "text",
            notNull: true,
        },
        phone: {
            type: "text",
        },
        company: {
            type: "text",
        },
        role_id: {
            type: "smallint",
            notNull: true,
            references: "roles(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        status_id: {
            type: "smallint",
            notNull: true,
            references: "user_statuses(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        profile_image_url: {
            type: "text",
        },
        last_login_at: {
            type: "timestamptz",
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });

    pgm.createTable("user_requests", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        email: {
            type: "citext",
            notNull: true,
        },
        password_hash: {
            type: "text",
            notNull: true,
        },
        name: {
            type: "text",
            notNull: true,
        },
        phone: {
            type: "text",
        },
        company: {
            type: "text",
        },
        requested_role_id: {
            type: "smallint",
            notNull: true,
            references: "roles(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        status_id: {
            type: "smallint",
            notNull: true,
            references: "request_statuses(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        request_source_type_id: {
            type: "smallint",
            notNull: true,
            references: "request_source_types(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        requested_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
        reviewed_at: {
            type: "timestamptz",
        },
        reviewed_by: {
            type: "uuid",
            references: "users(id)",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        rejection_reason: {
            type: "text",
        },
        created_user_id: {
            type: "uuid",
            references: "users(id)",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
    });

    pgm.createTable("user_management_log", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        target_user_id: {
            type: "uuid",
            notNull: true,
            references: "users(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        performed_by: {
            type: "uuid",
            notNull: true,
            references: "users(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        action_type_id: {
            type: "smallint",
            notNull: true,
            references: "user_admin_action_types(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        previous_status_id: {
            type: "smallint",
            references: "user_statuses(id)",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        new_status_id: {
            type: "smallint",
            references: "user_statuses(id)",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        previous_role_id: {
            type: "smallint",
            references: "roles(id)",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        new_role_id: {
            type: "smallint",
            references: "roles(id)",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        reason: {
            type: "text",
        },
        notes: {
            type: "text",
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });

    pgm.createTable("user_access_log", {
        id: {
            type: "uuid",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        user_id: {
            type: "uuid",
            references: "users(id)",
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        email_attempted: {
            type: "citext",
        },
        event_type_id: {
            type: "smallint",
            notNull: true,
            references: "access_event_types(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        result_type_id: {
            type: "smallint",
            notNull: true,
            references: "access_result_types(id)",
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        failure_reason: {
            type: "text",
        },
        session_token: {
            type: "text",
        },
        ip_address: {
            type: "inet",
        },
        user_agent: {
            type: "text",
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
        revoked_at: {
            type: "timestamptz",
        },
        expires_at: {
            type: "timestamptz",
        },
    });

    // ÍNDICES
    pgm.createIndex("users", "role_id");
    pgm.createIndex("users", "status_id");

    pgm.createIndex("user_requests", "requested_role_id");
    pgm.createIndex("user_requests", "status_id");
    pgm.createIndex("user_requests", "request_source_type_id");
    pgm.createIndex("user_requests", "reviewed_by");
    pgm.createIndex("user_requests", "created_user_id");
    pgm.createIndex("user_requests", "email");

    pgm.createIndex("user_management_log", "target_user_id");
    pgm.createIndex("user_management_log", "performed_by");
    pgm.createIndex("user_management_log", "action_type_id");
    pgm.createIndex("user_management_log", "created_at");

    pgm.createIndex("user_access_log", "user_id");
    pgm.createIndex("user_access_log", "event_type_id");
    pgm.createIndex("user_access_log", "result_type_id");
    pgm.createIndex("user_access_log", "session_token");
    pgm.createIndex("user_access_log", "created_at");
    pgm.createIndex("user_access_log", "email_attempted");

    // CHECKS
    pgm.addConstraint("users", "chk_users_last_login_after_created", {
        check: `last_login_at IS NULL OR last_login_at >= created_at`,
    });

    pgm.addConstraint("users", "chk_users_updated_at_after_created", {
        check: `updated_at >= created_at`,
    });

    pgm.addConstraint("user_requests", "chk_user_requests_reviewed_at_after_requested_at", {
        check: `reviewed_at IS NULL OR reviewed_at >= requested_at`,
    });

    pgm.addConstraint("user_access_log", "chk_user_access_log_user_or_email_present", {
        check: `user_id IS NOT NULL OR email_attempted IS NOT NULL`,
    });

    pgm.addConstraint("user_access_log", "chk_user_access_log_expires_after_created", {
        check: `expires_at IS NULL OR expires_at > created_at`,
    });

    pgm.addConstraint("user_access_log", "chk_user_access_log_revoked_after_created", {
        check: `revoked_at IS NULL OR revoked_at >= created_at`,
    });

    // SEEDS CATÁLOGOS
    pgm.sql(`
		INSERT INTO roles (id, code, name, description) VALUES
			(1, 'admin', 'Administrador', 'Acceso completo al sistema'),
			(2, 'commercial', 'Comercial', 'Gestión comercial y operativa'),
			(3, 'client', 'Cliente', 'Acceso restringido para clientes')
		ON CONFLICT (id) DO NOTHING;
	`);

    pgm.sql(`
		INSERT INTO user_statuses (id, code, name) VALUES
			(1, 'active', 'Activo'),
			(2, 'inactive', 'Inactivo'),
			(3, 'blocked', 'Bloqueado')
		ON CONFLICT (id) DO NOTHING;
	`);

    pgm.sql(`
		INSERT INTO request_statuses (id, code, name) VALUES
			(1, 'pending', 'Pendiente'),
			(2, 'approved', 'Aprobada'),
			(3, 'rejected', 'Rechazada')
		ON CONFLICT (id) DO NOTHING;
	`);

    pgm.sql(`
		INSERT INTO request_source_types (id, code, name) VALUES
			(1, 'self_registration', 'Autoregistro'),
			(2, 'admin_created', 'Creada por administrador'),
			(3, 'commercial_created', 'Creada por comercial')
		ON CONFLICT (id) DO NOTHING;
	`);

    pgm.sql(`
		INSERT INTO access_event_types (id, code, name) VALUES
			(1, 'login_attempt', 'Intento de inicio de sesión'),
			(2, 'login_success', 'Inicio de sesión correcto'),
			(3, 'login_failed', 'Inicio de sesión fallido'),
			(4, 'logout', 'Cierre de sesión'),
			(5, 'session_revoked', 'Sesión revocada'),
			(6, 'session_expired', 'Sesión expirada')
		ON CONFLICT (id) DO NOTHING;
	`);

    pgm.sql(`
		INSERT INTO access_result_types (id, code, name) VALUES
			(1, 'success', 'Éxito'),
			(2, 'failed', 'Fallido'),
			(3, 'revoked', 'Revocado'),
			(4, 'expired', 'Expirado')
		ON CONFLICT (id) DO NOTHING;
	`);

    pgm.sql(`
		INSERT INTO user_admin_action_types (id, code, name) VALUES
			(1, 'status_change', 'Cambio de estado'),
			(2, 'role_change', 'Cambio de rol'),
			(3, 'user_created', 'Usuario creado'),
			(4, 'user_approved', 'Usuario aprobado'),
			(5, 'user_rejected', 'Usuario rechazado'),
			(6, 'password_reset', 'Restablecimiento de contraseña')
		ON CONFLICT (id) DO NOTHING;
	`);

    // SEED USUARIOS
    pgm.sql(`
		INSERT INTO users (
			name,
			email,
			company,
			phone,
			password_hash,
			role_id,
			status_id,
			profile_image_url
		)
		VALUES
			(
				'Cliente',
				'cliente@email.com',
				'Empresa Cliente',
				NULL,
				'$2b$10$aVHXWMJF5Mkb2oJgc9qTku1N8Kf4e4QdU.t.0DzlMi1FLuMk/9AOy',
				3,
				1,
				NULL
			),
			(
				'Admin',
				'admin@email.com',
				NULL,
				NULL,
				'$2b$10$dq1fluYU8g4Gujmyoh1kJ./y2VkOnZI.olCwea9N5/Vpr9xTXkS5q',
				1,
				1,
				NULL
			),
			(
				'Comercial',
				'comercial@email.com',
				NULL,
				NULL,
				'$2b$10$H3v6ezPX8t3quLhzP01Tj.el7MGqrQLtc7TbhPNxH85zAl9RV09lW',
				2,
				1,
				NULL
			)
		ON CONFLICT (email) DO NOTHING;
	`);
};

exports.down = (pgm) => {
    pgm.dropTable("user_access_log");
    pgm.dropTable("user_management_log");
    pgm.dropTable("user_requests");
    pgm.dropTable("users");

    pgm.dropTable("user_admin_action_types");
    pgm.dropTable("access_result_types");
    pgm.dropTable("access_event_types");
    pgm.dropTable("request_source_types");
    pgm.dropTable("request_statuses");
    pgm.dropTable("user_statuses");
    pgm.dropTable("roles");
};
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async (pgm) => {
	// USER_ACCESS_LOG -> BIGINT

	pgm.addColumn("user_access_log", {
		id_new: {
			type: "bigserial",
		},
	});

	pgm.dropConstraint("user_access_log", "user_access_log_pkey");

	pgm.addConstraint("user_access_log", "user_access_log_pkey", {
		primaryKey: "id_new",
	});

	pgm.dropColumn("user_access_log", "id");

	pgm.renameColumn("user_access_log", "id_new", "id");

	// USER_MANAGEMENT_LOG -> BIGINT

	pgm.addColumn("user_management_log", {
		id_new: {
			type: "bigserial",
		},
	});

	pgm.dropConstraint("user_management_log", "user_management_log_pkey");

	pgm.addConstraint("user_management_log", "user_management_log_pkey", {
		primaryKey: "id_new",
	});

	pgm.dropColumn("user_management_log", "id");

	pgm.renameColumn("user_management_log", "id_new", "id");
};

exports.down = async (pgm) => {
	// USER_ACCESS_LOG -> UUID

	pgm.addColumn("user_access_log", {
		id_old: {
			type: "uuid",
			default: pgm.func("gen_random_uuid()"),
		},
	});

	pgm.dropConstraint("user_access_log", "user_access_log_pkey");

	pgm.addConstraint("user_access_log", "user_access_log_pkey", {
		primaryKey: "id_old",
	});

	pgm.dropColumn("user_access_log", "id");

	pgm.renameColumn("user_access_log", "id_old", "id");

	// USER_MANAGEMENT_LOG -> UUID

	pgm.addColumn("user_management_log", {
		id_old: {
			type: "uuid",
			default: pgm.func("gen_random_uuid()"),
		},
	});

	pgm.dropConstraint("user_management_log", "user_management_log_pkey");

	pgm.addConstraint("user_management_log", "user_management_log_pkey", {
		primaryKey: "id_old",
	});

	pgm.dropColumn("user_management_log", "id");

	pgm.renameColumn("user_management_log", "id_old", "id");
};
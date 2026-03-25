BEGIN;
-- ============================================================================
-- VALIDACIÓN
-- ============================================================================
DO $$
DECLARE kept_count integer;
BEGIN
SELECT COUNT(*) INTO kept_count
FROM users
WHERE email IN (
        'admin@email.com',
        'comercial@email.com',
        'cliente@email.com'
    );
IF kept_count <> 3 THEN RAISE EXCEPTION 'Se esperaban exactamente 3 usuarios a conservar, pero se encontraron %',
kept_count;
END IF;
END $$;
-- ============================================================================
-- LIMPIEZA
-- ============================================================================
DELETE FROM user_management_log;
DELETE FROM user_access_log;
DELETE FROM user_requests;
DELETE FROM users
WHERE email NOT IN (
        'admin@email.com',
        'comercial@email.com',
        'cliente@email.com'
    );
-- ============================================================================
-- RESET SOLO DE TABLAS CON SECUENCIA
-- ============================================================================
-- user_management_log (bigserial)
SELECT setval(
        pg_get_serial_sequence('user_management_log', 'id'),
        COALESCE(
            (
                SELECT MAX(id)
                FROM user_management_log
            ),
            0
        ) + 1,
        false
    );
-- user_access_log (bigserial)
SELECT setval(
        pg_get_serial_sequence('user_access_log', 'id'),
        COALESCE(
            (
                SELECT MAX(id)
                FROM user_access_log
            ),
            0
        ) + 1,
        false
    );
COMMIT;
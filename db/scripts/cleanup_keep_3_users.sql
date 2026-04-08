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
        'comercial@email.com'
    );
IF kept_count <> 2 THEN RAISE EXCEPTION 'Se esperaban exactamente 2 usuarios a conservar, pero se encontraron %',
kept_count;
END IF;
END $$;
-- ============================================================================
-- LIMPIEZA (orden IMPORTANTE por FK)
-- ============================================================================
-- M2 primero
DELETE FROM route_visits;
DELETE FROM commercial_routes;
DELETE FROM commercial_visits;
DELETE FROM clients;
-- M1 logs
DELETE FROM user_management_log;
DELETE FROM user_access_log;
-- Requests
DELETE FROM user_requests;
-- Usuarios (menos los 2 base)
DELETE FROM users
WHERE email NOT IN ('admin@email.com', 'comercial@email.com');
-- ============================================================================
-- RESET SECUENCIAS
-- ============================================================================
-- user_management_log
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
-- user_access_log
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
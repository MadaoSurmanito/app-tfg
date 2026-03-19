/* Tabla de usuarios */
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'comercial' CHECK (role IN ('admin', 'cliente', 'comercial')),
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'bloqueado')),
  image_url TEXT,
  last_login TIMESTAMPZ NOT NULL,
  created_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
  /* Validación para asegurar que el company no esté vacío si el usuario es cliente */
  CHECK (
    (
      role = 'cliente'
      AND company IS NOT NULL
      AND company <> ''
    )
    OR role IN ('admin', 'comercial')
  ),
  /* Validación para asegurar que el teléfono tenga un formato válido si se proporciona */
  CHECK (
    phone IS NULL
    OR phone ~ '^\+?[1-9]\d{1,14}$'
  ),
  /* Validación para asegurar que el correo electrónico tenga un formato válido */
  CHECK (
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  )
);
/* Tabla para solicitudes de registro de usuarios */
CREATE TABLE IF NOT EXISTS user_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email CITEXT NOT NULL,
  company TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('cliente', 'comercial')),
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
  requested_at TIMESTAMPZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPZ NOT NULL,
  /* Por ahora solo va a revisar el admin, pero por si acaso en el futuro se quiere que otro rol pueda revisar */
  reviewed_by UUID REFERENCES users(id) NOT NULL,
  rejection_reason TEXT,
  /* Validación para asegurar que el teléfono tenga un formato válido si se proporciona */
  CHECK (
    phone IS NULL
    OR phone ~ '^\+?[1-9]\d{1,14}$'
  ),
  /* Validación para asegurar que el correo electrónico tenga un formato válido */
  CHECK (
    email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  /* Validación para asegurar que el company no esté vacío */
  CHECK (company <> ''),
  /* Validación para asegurar que los campos relacionados con el estado de la solicitud sean consistentes */
  /* La solicitud debe estar en estado 'pendiente' si no ha sido revisada */
  CHECK (
    (
      status = 'pendiente'
      AND reviewed_at IS NULL
      AND reviewed_by IS NULL
      AND rejection_reason IS NULL
      AND approved_user_id IS NULL
    )
    /* La solicitud debe estar en estado 'aprobada' si ha sido revisada y aprobada */
    OR (
      status = 'aprobada'
      AND reviewed_at IS NOT NULL
      AND reviewed_by IS NOT NULL
      AND approved_user_id IS NOT NULL
      AND rejection_reason IS NULL
    )
    /* La solicitud debe estar en estado 'rechazada' si ha sido revisada y rechazada */
    OR (
      status = 'rechazada'
      AND reviewed_at IS NOT NULL
      AND reviewed_by IS NOT NULL
      AND approved_user_id IS NULL
    )
  )
);
/* Índice para asegurar que no haya solicitudes pendientes con el mismo correo electrónico, ignorando mayúsculas y minúsculas */
DROP INDEX IF EXISTS user_requests_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_requests_email_pending ON user_requests (lower(email))
WHERE status = 'pendiente';
INSERT INTO users (
    name,
    email,
    company,
    phone,
    password_hash,
    role,
    image_url
  )
VALUES (
    'Cliente',
    'cliente@email.com',
    'Empresa Cliente',
    NULL,
    /*1234*/
    '$2b$10$aVHXWMJF5Mkb2oJgc9qTku1N8Kf4e4QdU.t.0DzlMi1FLuMk/9AOy',
    'cliente',
    NULL
  ),
  (
    'Admin',
    'admin@email.com',
    NULL,
    NULL,
    /*admin*/
    '$2b$10$dq1fluYU8g4Gujmyoh1kJ./y2VkOnZI.olCwea9N5/Vpr9xTXkS5q',
    'admin',
    NULL
  ),
  (
    'Comercial',
    'comercial@email.com',
    NULL,
    NULL,
    /*comer*/
    '$2b$10$H3v6ezPX8t3quLhzP01Tj.el7MGqrQLtc7TbhPNxH85zAl9RV09lW',
    'comercial',
    NULL
  );
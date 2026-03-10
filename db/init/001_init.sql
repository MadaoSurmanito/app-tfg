CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'comercial' CHECK (role IN ('admin', 'cliente', 'comercial')),
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO
  users (name, email, password_hash, role, image_url)
VALUES
  (
    'Cliente',
    'cliente@email.com',
    '$2b$10$aVHXWMJF5Mkb2oJgc9qTku1N8Kf4e4QdU.t.0DzlMi1FLuMk/9AOy',
    /* 1234 */
    'cliente',
    NULL
  ),
  (
    'Admin',
    'admin@email.com',
    '$2b$10$dq1fluYU8g4Gujmyoh1kJ./y2VkOnZI.olCwea9N5/Vpr9xTXkS5q',
    /* admin */
    'admin',
    NULL
  ),
  (
    'Comercial',
    'comercial@email.com',
    '$2b$10$H3v6ezPX8t3quLhzP01Tj.el7MGqrQLtc7TbhPNxH85zAl9RV09lW',
    /* comer */
    'comercial',
    NULL
  );
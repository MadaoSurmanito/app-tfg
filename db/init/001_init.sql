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
    'Alex',
    'correo@gmail.com',
    '$2b$10$aVHXWMJF5Mkb2oJgc9qTku1N8Kf4e4QdU.t.0DzlMi1FLuMk/9AOy',
    'comercial',
    NULL
  );
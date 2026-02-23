CREATE TABLE IF NOT EXISTS demo_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO demo_items (name) VALUES
('Item 1'),
('Item 2'),
('Item 3');
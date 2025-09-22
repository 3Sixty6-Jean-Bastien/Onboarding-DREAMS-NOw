-- D1 schema: tenants, steps, uploads, flags
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS steps (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  step_key TEXT,
  status TEXT,
  data JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  filename TEXT,
  r2_key TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

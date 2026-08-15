CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIEWER' CHECK(role IN ('ADMIN', 'AUDITOR', 'VIEWER')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS risks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  likelihood INTEGER NOT NULL DEFAULT 3 CHECK(likelihood BETWEEN 1 AND 5),
  impact INTEGER NOT NULL DEFAULT 3 CHECK(impact BETWEEN 1 AND 5),
  risk_score INTEGER NOT NULL DEFAULT 9,
  risk_level TEXT NOT NULL DEFAULT 'MEDIUM',
  category TEXT NOT NULL DEFAULT 'Technical',
  mitigation_plan TEXT NOT NULL DEFAULT '',
  asset_id TEXT,
  asset_name TEXT,
  assignee TEXT NOT NULL DEFAULT 'SecOps Team',
  target_framework_controls TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'CLOUD_INFRA',
  criticality TEXT NOT NULL DEFAULT 'MEDIUM',
  ip_address TEXT,
  owner TEXT NOT NULL DEFAULT 'IT Ops',
  department TEXT NOT NULL DEFAULT 'Engineering',
  location TEXT NOT NULL DEFAULT 'Cloud',
  risk_count INTEGER NOT NULL DEFAULT 0,
  incident_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS controls (
  id TEXT PRIMARY KEY,
  control_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  framework TEXT NOT NULL CHECK(framework IN ('ISO_27001', 'NIST_CSF_2')),
  status TEXT NOT NULL DEFAULT 'NOT_IMPLEMENTED',
  evidence_ids TEXT DEFAULT '[]',
  owner TEXT NOT NULL DEFAULT '',
  notes TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL DEFAULT '0 MB',
  file_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  uploaded_by TEXT NOT NULL DEFAULT 'System',
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  linked_control_ids TEXT DEFAULT '[]',
  notes TEXT,
  file_path TEXT
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'HIGH',
  status TEXT NOT NULL DEFAULT 'NEW',
  asset_id TEXT,
  asset_name TEXT,
  reporter TEXT NOT NULL DEFAULT 'SOC',
  reported_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  root_cause TEXT,
  action_items TEXT DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_score ON risks(risk_score);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_controls_framework ON controls(framework);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);

import bcrypt from "bcrypt";
import { getDb } from "./connection.js";
import fs from "fs";
import path from "path";

export function initDatabase(): void {
  const db = getDb();

  // Resolve schema.sql path robustly so it works both when running from source
  // and after the server is bundled to dist/server.cjs (where import.meta is not available).
  const candidates = [
    // If schema is next to the compiled file at runtime (common during development/build)
    path.join(typeof __dirname !== "undefined" ? __dirname : process.cwd(), "schema.sql"),
    // Original location in the source tree
    path.join(process.cwd(), "server", "db", "schema.sql"),
    // Fallbacks
    path.join(process.cwd(), "schema.sql"),
    path.join(process.cwd(), "server", "schema.sql"),
  ];

  const schemaPath = candidates.find((p) => fs.existsSync(p));
  if (!schemaPath) {
    throw new Error(
      `schema.sql not found. Checked paths: ${candidates.join(", ")}`
    );
  }

  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    seedDefaultUser(db);
  }

  const riskCount = db.prepare("SELECT COUNT(*) as count FROM risks").get() as { count: number };
  if (riskCount.count === 0) {
    seedInitialData(db);
  }
}

function seedDefaultUser(db: ReturnType<typeof getDb>): void {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hash = bcrypt.hashSync(adminPassword, 10);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run("usr-admin-001", "admin@cygrx.io", hash, "System Administrator", "ADMIN");
}

function seedInitialData(db: ReturnType<typeof getDb>): void {
  const insertRisk = db.prepare(`
    INSERT INTO risks (id, title, description, likelihood, impact, risk_score, risk_level, category, mitigation_plan, asset_id, asset_name, assignee, target_framework_controls, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const risks = [
    ["rsk-001", "Unpatched Vulnerability in K8s Ingress Controller (CVE-2026-1940)", "Ingress controller image running outdated version susceptible to remote code execution and unauthorized pod escape.", 5, 5, 25, "CRITICAL", "INFRA", "Update ingress controller to latest patched image and add image scanning.", "ast-101", "Production Kubernetes Cluster (AWS EKS)", "DevOps Team", JSON.stringify(["ctl-iso-3"]), "OPEN", "2026-01-10", "2026-01-10"],
    ["rsk-002", "Database Backup Unencrypted at Rest in Secondary S3 Bucket", "Legacy database snapshots stored in secondary DR region lack AWS KMS customer-managed key encryption enforcement.", 3, 4, 12, "HIGH", "DATA", "Apply KMS encryption policy to backup buckets and rotate keys.", "ast-102", "Customer Financial Database (PostgreSQL)", "Database Admin", JSON.stringify(["ctl-iso-4"]), "OPEN", "2026-01-15", "2026-01-15"],
    ["rsk-003", "Lack of Multi-Factor Authentication Enforcement for Legacy Contractor Portal", "Contractor vendor accounts access internal staging environment via single-factor password authentication.", 4, 3, 12, "HIGH", "ACCESS", "Enforce MFA via identity provider and block legacy auth flows.", "ast-103", "Okta Identity Provider & SSO", "Security Ops", JSON.stringify(["ctl-nist-2"]), "OPEN", "2026-02-01", "2026-02-01"],
    ["rsk-004", "Inadequate Third-Party SOC 2 Vendor Assessment for Analytics SaaS", "Third-party customer telemetry vendor hasn't renewed SOC 2 Type II report for over 18 months, posing vendor compliance risk.", 3, 3, 9, "MEDIUM", "VENDOR", "Request current SOC 2 report and perform risk re-assessment.", "ast-105", "Salesforce CRM & Customer Vault", "Business Systems", JSON.stringify(["ctl-iso-5"]), "OPEN", "2026-03-01", "2026-03-01"],
    ["rsk-005", "Insider Threat & Missing Endpoint DLP Controls on Remote Laptops", "Remote developer laptops allow unrestricted USB storage devices and unmonitored file exports to unauthorized cloud providers.", 3, 3, 9, "MEDIUM", "ENDPOINT", "Deploy DLP agents and restrict removable media via MDM.", "ast-106", "Executive Laptop Fleet (MacBook Pro M3)", "IT Support Lead", JSON.stringify(["ctl-iso-6"]), "OPEN", "2026-03-15", "2026-03-15"],
    ["rsk-006", "API Rate Limiting & Web Application Firewall Bypasses on Payment Service", "Payment API endpoint lacks granular rate limiting, exposing backend to abusive traffic.", 4, 4, 16, "CRITICAL", "APPLICATION", "Implement WAF rules and per-client rate limits.", "ast-104", "Core Payment Gateway API Microservice", "FinTech Lead", JSON.stringify(["ctl-nist-3"]), "OPEN", "2026-02-14", "2026-02-14"],
  ];

  const insertMany = db.transaction(() => {
    for (const r of risks) insertRisk.run(...r);
  });
  insertMany();

  const insertAsset = db.prepare(`
    INSERT INTO assets (id, name, type, criticality, ip_address, owner, department, location, risk_count, incident_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const assets = [
    ["ast-101", "Production Kubernetes Cluster (AWS EKS)", "CLOUD_INFRA", "CRITICAL", "10.0.12.45 / k8s.prod.internal", "DevOps Team", "Cloud Engineering", "AWS us-east-1", 3, 1, "2026-01-10"],
    ["ast-102", "Customer Financial Database (PostgreSQL)", "DATA_STORE", "CRITICAL", "10.0.24.88", "Database Admin", "Data Platform", "AWS us-east-1 (RDS Aurora)", 2, 0, "2026-01-15"],
    ["ast-103", "Okta Identity Provider & SSO", "SOFTWARE", "HIGH", "sso.aegis-enterprise.com", "Security Ops", "Information Security", "SaaS", 1, 0, "2026-02-01"],
    ["ast-104", "Core Payment Gateway API Microservice", "SOFTWARE", "CRITICAL", "api.payments.aegis.io", "FinTech Lead", "Product Engineering", "AWS EKS Cluster", 2, 1, "2026-02-14"],
    ["ast-105", "Salesforce CRM & Customer Vault", "THIRD_PARTY_VENDOR", "HIGH", "aegis.my.salesforce.com", "Sales Operations", "Business Systems", "Vendor Cloud", 1, 0, "2026-03-01"],
    ["ast-106", "Executive Laptop Fleet (MacBook Pro M3)", "HARDWARE", "MEDIUM", "DHCP Dynamic (MDM Enrolled)", "IT Support Lead", "Internal IT", "Global Distributed", 1, 0, "2026-03-15"],
  ];

  const insertAssets = db.transaction(() => {
    for (const a of assets) insertAsset.run(...a);
  });
  insertAssets();

  const insertControl = db.prepare(`
    INSERT INTO controls (id, control_id, title, description, category, framework, status, evidence_ids, owner, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const isoControls = [
    ["ctl-iso-1", "A.5.1", "Policies for Information Security", "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acted upon.", "Governance", "ISO_27001", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-iso-2", "A.5.15", "Access Control", "Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security risk.", "Access", "ISO_27001", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-iso-3", "A.8.8", "Management of Technical Vulnerabilities", "Information about technical vulnerabilities of information systems in use shall be obtained, the organization's exposure to such vulnerabilities evaluated and appropriate measures taken.", "Technical", "ISO_27001", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-iso-4", "A.8.24", "Use of Cryptography", "Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.", "Technological Controls", "ISO_27001", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-iso-5", "A.5.19", "Information Security in Supplier Relationships", "Processes and procedures shall be defined and implemented to manage the information security risks associated with supplier relationships.", "Vendor", "ISO_27001", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-iso-6", "A.8.12", "Data Leakage Prevention", "Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.", "Technical", "ISO_27001", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
  ];

  const nistControls = [
    ["ctl-nist-1", "ID.AM-1", "Physical and Virtual Asset Inventory", "Physical devices and systems within the organization are inventoried and tracked across their lifecycle.", "Identify (ID)", "NIST_CSF_2", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-nist-2", "PR.AC-1", "Identities and Credentials Management", "Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices and users.", "Protect (PR)", "NIST_CSF_2", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-nist-3", "DE.CM-1", "Continuous Security Monitoring", "The network environment is monitored to detect potential cybersecurity events and anomalous activity.", "Detect (DE)", "NIST_CSF_2", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-nist-4", "RS.RP-1", "Incident Response Plan Execution", "Response plan is executed during or after an incident to contain impact and ensure business continuity.", "Respond (RS)", "NIST_CSF_2", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
    ["ctl-nist-5", "RC.RP-1", "Recovery Plan Implementation", "Recovery processes and procedures are executed and maintained to ensure restoration of systems affected by cybersecurity incidents.", "Recover (RC)", "NIST_CSF_2", "ACTIVE", JSON.stringify([]), "Security Team", "Initial seed", "2026-01-01"],
  ];

  const insertControls = db.transaction(() => {
    for (const c of isoControls) insertControl.run(...c);
    for (const c of nistControls) insertControl.run(...c);
  });
  insertControls();

  const insertEvidence = db.prepare(`
    INSERT INTO evidence (id, title, file_name, file_size, file_type, uploaded_by, uploaded_at, linked_control_ids, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const evidences = [
    ["ev-201", "ISO 27001 Information Security Policy 2026 v4.2.pdf", "ISO27001_SecPolicy_2026.pdf", "2.4 MB", "application/pdf", "Sarah Jenkins (GRC Lead)", "2026-07-01", JSON.stringify(["ctl-iso-1"]), "Initial policy document"],
    ["ev-202", "Okta SSO MFA Enforcement Audit Matrix Export.csv", "Okta_MFA_Export_Q3.csv", "840 KB", "text/csv", "Marcus Vance (IAM)", "2026-08-02", JSON.stringify(["ctl-iso-2", "ctl-nist-2"]), "MFA enforcement export"],
    ["ev-203", "Tenable Vulnerability Executive Summary Scan Q3.pdf", "Tenable_VulnScan_Q3_2026.pdf", "4.1 MB", "application/pdf", "Elena Rostova (SecOps)", "2026-08-04", JSON.stringify(["ctl-iso-3"]), "Vulnerability scan summary"],
    ["ev-204", "AWS KMS Encryption Enforcement Architecture Certificate.png", "AWS_KMS_Config_Evidence.png", "1.2 MB", "image/png", "DevOps Team", "2026-07-20", JSON.stringify(["ctl-iso-4", "ctl-nist-3"]), "KMS config screenshot"],
    ["ev-205", "Netskope Cloud DLP Rule Set Verification Screenshot.png", "Netskope_DLP_Config.png", "1.8 MB", "image/png", "David Chen", "2026-07-29", JSON.stringify(["ctl-iso-6"]), "Rule screenshot"],
  ];

  const insertEvidences = db.transaction(() => {
    for (const e of evidences) insertEvidence.run(...e);
  });
  insertEvidences();

  const insertIncident = db.prepare(`
    INSERT INTO incidents (id, title, description, severity, status, asset_id, asset_name, reporter, reported_at, root_cause, action_items)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const incidents = [
    ["inc-501", "Suspicious API Authentication Spike from Unauthorized Autonomous Subnet", "Automated alert triggered due to 14,000 failed password attempts targeting Payment API microservice with unusual IP distribution.", "HIGH", "OPEN", "ast-104", "Core Payment Gateway API Microservice", "Threat Detection", "2026-06-30", "Brute-force attack via exposed auth endpoint", JSON.stringify(["Investigate auth logs", "Rate-limit and block offending IPs"])],
    ["inc-502", "Kubernetes Ingress Pod Anomalous Process Spawning Alert", "GuardDuty detected unexpected process execution (curl payload fetch) inside NGINX Ingress pod container.", "CRITICAL", "OPEN", "ast-101", "Production Kubernetes Cluster (AWS EKS)", "SecOps", "2026-07-05", "Container compromise due to outdated image", JSON.stringify(["Isolate pod", "Rotate secrets", "Patch ingress image"])],
  ];

  const insertIncidents = db.transaction(() => {
    for (const i of incidents) insertIncident.run(...i);
  });
  insertIncidents();

  console.log("[DB] Database seeded with initial data.");
}

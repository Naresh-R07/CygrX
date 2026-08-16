import bcrypt from "bcrypt";
import { getDb } from "./connection.js";
import fs from "fs";
import path from "path";

export function initDatabase(): void {
  const db = getDb();

  const schemaPath = path.join(import.meta.dirname || process.cwd(), "schema.sql");
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
    ["rsk-001", "Unpatched Vulnerability in K8s Ingress Controller (CVE-2026-1940)", "Ingress controller image running outdated version susceptible to remote code execution and unauthorized pod escalation.", 4, 5, 20, "CRITICAL", "Technical", "Upgrade EKS NGINX Ingress Controller to v1.10.2; apply network security policies to restrict inter-pod communication.", "ast-101", "Production Kubernetes Cluster (AWS EKS)", "Alex Rivera (DevOps)", JSON.stringify(["ISO 27001 A.8.8", "NIST PR.IP-1"]), "OPEN", "2026-07-28", "2026-08-01"],
    ["rsk-002", "Database Backup Unencrypted at Rest in Secondary S3 Bucket", "Legacy database snapshots stored in secondary DR region lack AWS KMS customer-managed key encryption enforcement.", 3, 5, 15, "HIGH", "Technical", "Enforce S3 bucket default encryption with KMS SSE-KMS and enable GCP/AWS KMS key rotation.", "ast-102", "Customer Financial Database (PostgreSQL)", "Elena Rostova (SecOps)", JSON.stringify(["ISO 27001 A.8.24", "NIST PR.DS-1"]), "UNDER_REVIEW", "2026-07-15", "2026-08-03"],
    ["rsk-003", "Lack of Multi-Factor Authentication Enforcement for Legacy Contractor Portal", "Contractor vendor accounts access internal staging environment via single-factor password authentication without TOTP/FIDO2 MFA enforcement.", 4, 4, 16, "CRITICAL", "Organizational", "Migrate contractor portal to Okta SSO with mandatory WebAuthn/FIDO2 hardware token requirement.", "ast-103", "Okta Identity Provider & SSO", "Marcus Vance (IAM Lead)", JSON.stringify(["ISO 27001 A.5.15", "NIST PR.AC-1"]), "OPEN", "2026-07-20", "2026-08-02"],
    ["rsk-004", "Inadequate Third-Party SOC 2 Vendor Assessment for Analytics SaaS", "Third-party customer telemetry vendor hasn't renewed SOC 2 Type II report for over 18 months, posing vendor compliance exposure.", 3, 3, 9, "MEDIUM", "Third-Party", "Issue Vendor Risk Assessment questionnaire; require vendor bridge letter or trigger migration to compliant provider.", "ast-105", "Salesforce CRM & Customer Vault", "Sarah Jenkins (GRC Specialist)", JSON.stringify(["ISO 27001 A.5.19", "NIST ID.SC-3"]), "UNDER_REVIEW", "2026-07-10", "2026-08-04"],
    ["rsk-005", "Insider Threat & Missing Endpoint DLP Controls on Remote Laptops", "Remote developer laptops allow unrestricted USB storage devices and unmonitored file exports to unauthorized cloud drives.", 2, 4, 8, "MEDIUM", "Organizational", "Deploy CrowdStrike Endpoint Protection with USB storage policy restriction and Netskope Cloud DLP.", "ast-106", "Executive Laptop Fleet (MacBook Pro M3)", "David Chen (IT Security)", JSON.stringify(["ISO 27001 A.7.10", "NIST PR.PT-1"]), "MITIGATED", "2026-06-18", "2026-07-30"],
    ["rsk-006", "API Rate Limiting & Web Application Firewall Bypasses on Payment Service", "Payment API endpoint lacks granular rate limiting, exposing backend to distributed denial of service (DDoS) credential stuffing.", 3, 4, 12, "HIGH", "Technical", "Configure Cloudflare Enterprise WAF rate limiting rules and implement Redis-backed IP token bucket throttling.", "ast-104", "Core Payment Gateway API Microservice", "Alex Rivera (DevOps)", JSON.stringify(["ISO 27001 A.8.20", "NIST PR.DS-5"]), "OPEN", "2026-07-25", "2026-08-03"],
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
    ["ctl-iso-1", "A.5.1", "Policies for Information Security", "Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel.", "Organizational Controls", "ISO_27001", "FULLY_IMPLEMENTED", JSON.stringify(["ev-201"]), "CISO Office", "Updated 2026 Security Policy document published on internal Confluence and signed off by Board.", "2026-07-01"],
    ["ctl-iso-2", "A.5.15", "Access Control", "Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.", "Organizational Controls", "ISO_27001", "PARTIALLY_IMPLEMENTED", JSON.stringify(["ev-202"]), "IAM Team Lead", "SSO implemented for 90% of core apps. Legacy contractor staging portal currently pending mandatory MFA rollout.", "2026-08-02"],
    ["ctl-iso-3", "A.8.8", "Management of Technical Vulnerabilities", "Information about technical vulnerabilities of information systems in use shall be obtained, the organization's exposure to such vulnerabilities evaluated and appropriate measures taken.", "Technological Controls", "ISO_27001", "PARTIALLY_IMPLEMENTED", JSON.stringify(["ev-203"]), "SecOps Lead", "Weekly Tenable vulnerability scans active. Remediation SLA met for High/Critical within 7 days.", "2026-08-04"],
    ["ctl-iso-4", "A.8.24", "Use of Cryptography", "Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.", "Technological Controls", "ISO_27001", "FULLY_IMPLEMENTED", JSON.stringify(["ev-204"]), "Data Engineering", "TLS 1.3 enforced for all external endpoints; AES-256 KMS customer-managed keys used for RDS DBs.", "2026-07-20"],
    ["ctl-iso-5", "A.5.19", "Information Security in Supplier Relationships", "Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier's products or services.", "Organizational Controls", "ISO_27001", "NOT_IMPLEMENTED", JSON.stringify([]), "GRC Lead", "Vendor assessment workflow needs standardization. Reviewing annual SOC 2 reports manually.", "2026-07-15"],
    ["ctl-iso-6", "A.8.12", "Data Leakage Prevention", "Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.", "Technological Controls", "ISO_27001", "PARTIALLY_IMPLEMENTED", JSON.stringify(["ev-205"]), "IT Security", "Cloud DLP rules enabled in Google Workspace and Salesforce. Endpoint USB blocking rollout in progress.", "2026-07-29"],
  ];

  const nistControls = [
    ["ctl-nist-1", "ID.AM-1", "Physical and Virtual Asset Inventory", "Physical devices and systems within the organization are inventoried and tracked across their lifecycle.", "Identify (ID)", "NIST_CSF_2", "FULLY_IMPLEMENTED", JSON.stringify(["ev-206"]), "Asset Manager", "Automated AWS Config & Terraform state indexing feeds into central GRC inventory daily.", "2026-07-10"],
    ["ctl-nist-2", "PR.AC-1", "Identities and Credentials Management", "Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices and users.", "Protect (PR)", "NIST_CSF_2", "PARTIALLY_IMPLEMENTED", JSON.stringify(["ev-202"]), "IAM Team Lead", "Okta SCIM provisioning active across 85% of software assets.", "2026-08-01"],
    ["ctl-nist-3", "DE.CM-1", "Continuous Security Monitoring", "The network environment is monitored to detect potential cybersecurity events and anomalous activity.", "Detect (DE)", "NIST_CSF_2", "FULLY_IMPLEMENTED", JSON.stringify(["ev-207"]), "SOC Director", "Datadog SIEM + AWS GuardDuty integrated with 24/7 Security Operations Center alerting.", "2026-08-03"],
    ["ctl-nist-4", "RS.RP-1", "Incident Response Plan Execution", "Response plan is executed during or after an incident to contain impact and ensure business continuity.", "Respond (RS)", "NIST_CSF_2", "PARTIALLY_IMPLEMENTED", JSON.stringify(["ev-208"]), "Incident Command Lead", "Playbooks established for ransomware & data breach. Tabletop exercise conducted Q1 2026.", "2026-07-18"],
    ["ctl-nist-5", "RC.RP-1", "Recovery Plan Implementation", "Recovery processes and procedures are executed and maintained to ensure restoration of systems affected by cybersecurity incidents.", "Recover (RC)", "NIST_CSF_2", "FULLY_IMPLEMENTED", JSON.stringify(["ev-204"]), "Disaster Recovery Lead", "RTO 4 hours and RPO 1 hour verified in cross-region AWS failover drill in June 2026.", "2026-06-30"],
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
    ["ev-201", "ISO 27001 Information Security Policy 2026 v4.2.pdf", "ISO27001_SecPolicy_2026.pdf", "2.4 MB", "application/pdf", "Sarah Jenkins (GRC Lead)", "2026-07-01", JSON.stringify(["ctl-iso-1"]), "Approved by executive board; includes access control, data protection, and acceptable use policies."],
    ["ev-202", "Okta SSO MFA Enforcement Audit Matrix Export.csv", "Okta_MFA_Export_Q3.csv", "840 KB", "text/csv", "Marcus Vance (IAM)", "2026-08-02", JSON.stringify(["ctl-iso-2", "ctl-nist-2"]), "Export of all active enterprise user accounts with FIDO2 MFA status validation."],
    ["ev-203", "Tenable Vulnerability Executive Summary Scan Q3.pdf", "Tenable_VulnScan_Q3_2026.pdf", "4.1 MB", "application/pdf", "Elena Rostova (SecOps)", "2026-08-04", JSON.stringify(["ctl-iso-3"]), "Automated scan report covering production EKS clusters, AWS EC2 instances, and external edge gateways."],
    ["ev-204", "AWS KMS Encryption Enforcement Architecture Certificate.png", "AWS_KMS_Config_Evidence.png", "1.2 MB", "image/png", "DevOps Team", "2026-07-20", JSON.stringify(["ctl-iso-4", "ctl-nist-5"]), "Screenshot of AWS Config rule enforcing default KMS SSE-KMS across all RDS and DynamoDB databases."],
    ["ev-205", "Netskope Cloud DLP Rule Set Verification Screenshot.png", "Netskope_DLP_Config.png", "1.8 MB", "image/png", "David Chen", "2026-07-29", JSON.stringify(["ctl-iso-6"]), "Rule screenshot showing blocking of SSNs, Credit Cards, and API Keys in outgoing corporate email."],
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
    ["inc-501", "Suspicious API Authentication Spike from Unauthorized Autonomous Subnet", "Automated alert triggered due to 14,000 failed password attempts targeting Payment API microservice within 10 minutes.", "HIGH", "CONTAINED", "ast-104", "Core Payment Gateway API Microservice", "Datadog SIEM Alert Bot", "2026-08-04 14:22 UTC", "Credential stuffing campaign originating from IP range 185.220.x.x.", JSON.stringify(["Rate limited offending IP blocks via Cloudflare WAF", "Enforced CAPTCHA challenge on payment authentication endpoint", "Notified payment provider security team"])],
    ["inc-502", "Kubernetes Ingress Pod Anomalous Process Spawning Alert", "GuardDuty detected unexpected process execution (curl payload fetch) inside NGINX Ingress pod container.", "CRITICAL", "INVESTIGATING", "ast-101", "Production Kubernetes Cluster (AWS EKS)", "AWS GuardDuty Runtime Security", "2026-08-05 08:15 UTC", "Investigating potential CVE-2026-1940 exploitation attempt.", JSON.stringify(["Isolated affected EKS node via security group egress deny", "Gathered memory dump and container logs for forensic triage", "Preparing hotfix deployment for ingress image"])],
  ];

  const insertIncidents = db.transaction(() => {
    for (const i of incidents) insertIncident.run(...i);
  });
  insertIncidents();

  console.log("[DB] Database seeded with initial data.");
}

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  RotateCcw
} from "lucide-react";
import { ChatMessage, Risk, Control, Asset, Incident } from "../types";

interface AiSecurityAdvisorProps {
  risks: Risk[];
  isoControls: Control[];
  nistControls: Control[];
  assets: Asset[];
  incidents: Incident[];
  activeTargetRisk?: Risk | null;
  onClearTargetRisk?: () => void;
  activeTargetControl?: Control | null;
  onClearTargetControl?: () => void;
}

function generateLocalRecommendation(risk: Risk, isoControls: Control[], nistControls: Control[]): string {
  const score = risk.riskScore;
  const level = score >= 16 ? "CRITICAL" : score >= 10 ? "HIGH" : score >= 5 ? "MEDIUM" : "LOW";
  const priority = score >= 16 ? "Immediate (24 hours)" : score >= 10 ? "Short-term (7 days)" : "Medium-term (30 days)";

  const matchingIso = isoControls.filter(c =>
    risk.targetFrameworkControls?.some(tf => tf.includes(c.controlId))
  );
  const matchingNist = nistControls.filter(c =>
    risk.targetFrameworkControls?.some(tf => tf.includes(c.controlId))
  );

  const actions = [
    "Conduct detailed technical assessment of the affected asset and scope of exposure",
    "Implement compensating controls to reduce immediate attack surface",
    "Schedule remediation review within the defined priority window",
    "Document findings and update risk register with current status",
  ];

  let rec = `### AI Security Recommendation for "${risk.title}"\n\n`;
  rec += `**Executive Threat Summary:**\n`;
  rec += `${risk.description}\n\n`;
  rec += `**Priority:** ${priority} | **Risk Rating:** ${level} (${score}/25)\n\n`;
  rec += `**Recommended Action Steps:**\n`;
  rec += actions.map(a => `- ${a}`).join("\n") + "\n\n";

  if (matchingIso.length > 0 || matchingNist.length > 0) {
    rec += `**Target Framework Standard Controls:**\n`;
    matchingIso.forEach(c => {
      rec += `- **ISO 27001 ${c.controlId} (${c.title})**: ${c.description}\n`;
    });
    matchingNist.forEach(c => {
      rec += `- **NIST CSF ${c.controlId} (${c.title})**: ${c.description}\n`;
    });
  } else {
    rec += `**Suggested Controls:**\n`;
    rec += `- ISO 27001 A.8.8 Management of technical vulnerabilities\n`;
    rec += `- NIST PR.IP-1 Protection of Info Assets\n`;
  }

  return rec;
}

function generateLocalChatReply(
  prompt: string,
  risks: Risk[],
  isoControls: Control[],
  nistControls: Control[],
  assets: Asset[],
  incidents: Incident[]
): string {
  const openCount = risks.filter(r => r.status === "OPEN").length;
  const critCount = risks.filter(r => r.riskScore >= 16).length;
  const highCount = risks.filter(r => r.riskScore >= 10 && r.riskScore < 16).length;
  const isoScore = Math.round((isoControls.filter(c => c.status === "FULLY_IMPLEMENTED").length / isoControls.length) * 100);
  const nistScore = Math.round((nistControls.filter(c => c.status === "FULLY_IMPLEMENTED").length / nistControls.length) * 100);
  const openIncidents = incidents.filter(i => i.status !== "CLOSED").length;
  const notImplIso = isoControls.filter(c => c.status === "NOT_IMPLEMENTED");
  const notImplNist = nistControls.filter(c => c.status === "NOT_IMPLEMENTED");
  const partialIso = isoControls.filter(c => c.status === "PARTIALLY_IMPLEMENTED");
  const partialNist = nistControls.filter(c => c.status === "PARTIALLY_IMPLEMENTED");
  const criticalAssets = assets.filter(a => a.criticality === "CRITICAL");

  const lower = prompt.toLowerCase();
  const has = (terms: string[]) => terms.some(t => lower.includes(t));

  if (has(["hello", "hi ", "hi!", "hey", "good morning", "good afternoon", "good evening"])) {
    return `Hello! I'm your AI Cybersecurity Lead Auditor, certified in ISO 27001:2022, NIST CSF 2.0, and SOC 2 Type II.\n\nHere's your live security posture:\n- Open Risks: ${openCount} (${critCount} Critical, ${highCount} High)\n- ISO 27001 Readiness: ${isoScore}% (${notImplIso.length} NOT_IMPLEMENTED controls)\n- NIST CSF 2.0 Maturity: ${nistScore}%\n- Assets Monitored: ${assets.length} (${criticalAssets.length} Critical)\n- Active Incidents: ${openIncidents}\n\nI can assist with:\n- Threat analysis and risk assessment\n- ISO 27001 & NIST CSF 2.0 gap analysis\n- Incident response planning\n- Control recommendations and remediation\n- Security architecture guidance\n\nWhat would you like to discuss?`;
  }

  if (has(["who are you", "what are you", "what can you do", "help", "capabilities", "what do you know"])) {
    return `I am an AI-powered Cybersecurity Lead Auditor and SOC Advisor with expertise across:\n\n**Frameworks & Standards:**\n- ISO 27001:2022 (Annex A controls, ISMS)\n- NIST Cybersecurity Framework 2.0 (6 Functions, 22 Categories)\n- SOC 2 Type II (Trust Services Criteria)\n- NIST SP 800-53, NIST SP 800-61r2\n\n**Specializations:**\n- Risk assessment and vulnerability management\n- Incident response and digital forensics\n- Access control and identity governance\n- Network security architecture\n- Cloud security (AWS, Azure, GCP)\n- Compliance auditing and remediation\n\n**Your Environment:**\nI have real-time access to your GRC platform data including ${risks.length} identified risks, ${assets.length} managed assets, ${isoControls.length + nistControls.length} framework controls, and ${incidents.length} incident records.\n\nAsk me anything about cybersecurity, compliance, or your security posture.`;
  }

  if (has(["keylogger", "key logger"])) {
    const hasDlp = isoControls.some(c => c.controlId === "A.8.12" && c.status === "FULLY_IMPLEMENTED");
    const hasEndpoint = isoControls.some(c => c.controlId === "A.7.10" && c.status !== "NOT_IMPLEMENTED");
    return `### Keylogger — Threat Advisory\n\n**What it is:**\nA keylogger is a type of surveillance software (or hardware) that records every keystroke made on a computer or mobile device. It operates silently in the background, capturing usernames, passwords, credit card numbers, confidential messages, and other sensitive data. Keyloggers can be:\n\n- **Software-based:** Injected via phishing emails, malicious downloads, or exploiting unpatched vulnerabilities. Examples: Zeus/ZeuS, Agent.BTZ, Ardamax.\n- **Hardware-based:** Physical devices plugged between keyboard and USB port, often used in targeted physical access attacks.\n\n**How it works:**\n1. Installs as a kernel-level driver or user-mode hook\n2. Intercepts keyboard input events before they reach applications\n3. Stores captured data locally or exfiltrates it to a C2 server\n4. May also capture clipboard data, screenshots, and browser autofill\n\n**Risk to your environment:**\n- ${criticalAssets.length} critical assets could be compromised if endpoint protection is inadequate\n- Your DLP control (A.8.12) is currently ${hasDlp ? "FULLY IMPLEMENTED — provides monitoring for data exfiltration" : "NOT fully implemented — keyboard-level data capture is a significant gap"}\n- Your endpoint controls (A.7.10) are ${hasEndpoint ? "partially in place" : "NOT IMPLEMENTED — no USB or endpoint restrictions detected"}\n\n**Relevant Controls:**\n- **ISO 27001 A.8.12** (Data Leakage Prevention): ${hasDlp ? "Implemented" : "NOT IMPLEMENTED — critical gap"}\n- **ISO 27001 A.7.10** (Storage Media): ${hasEndpoint ? "Partially implemented" : "NOT IMPLEMENTED — no endpoint restrictions"}\n- **NIST PR.PT-1** (Audit Logs): Log keystroke anomalies through SIEM correlation\n\n**Recommended Actions:**\n1. Deploy EDR solution with behavioral keylogger detection (CrowdStrike, SentinelOne)\n2. Enable USB storage device restrictions via MDM policy\n3. Implement application whitelisting to block unauthorized keyboard hooks\n4. Deploy DLP rules to detect bulk data exfiltration patterns\n5. Conduct security awareness training on phishing-based keylogger delivery`;
  }

  if (has(["ransomware"])) {
    const hasRecovery = nistControls.some(c => c.controlId === "RC.RP-1" && c.status === "FULLY_IMPLEMENTED");
    return `### Ransomware — Threat Advisory\n\n**What it is:**\nRansomware is malicious software that encrypts files on a victim's system and demands payment (usually cryptocurrency) for the decryption key. Modern ransomware operations follow a "double extortion" model: they exfiltrate sensitive data before encryption, threatening to publish it if the ransom is not paid.\n\n**Attack Lifecycle (MITRE ATT&CK):**\n1. **Initial Access:** Phishing emails, RDP brute-force, exploit public-facing applications\n2. **Execution:** PowerShell scripts, Cobalt Strike beacons, living-off-the-land binaries\n3. **Privilege Escalation:** Mimikatz credential dumping, Kerberoasting\n4. **Lateral Movement:** PsExec, WMI, SMB to reach backup systems and domain controllers\n5. **Impact:** Encrypt files with AES-2048/RSA-2048, delete Volume Shadow Copies\n\n**Notable Groups:** LockBit 3.0, BlackCat/ALPHV, Cl0p, Royal, Akira\n\n**Risk to your environment:**\n- You have ${openCount} open risks with ${critCount} rated CRITICAL — ransomware exploitation of these could be devastating\n- Recovery capability: ${hasRecovery ? "NIST RC.RP-1 is IMPLEMENTED — you have recovery processes" : "NIST RC.RP-1 is NOT fully implemented — recovery may be unreliable"}\n- ${criticalAssets.length} critical assets identified in your inventory\n\n**Relevant Controls:**\n- **ISO 27001 A.8.24** (Use of Cryptography): Encrypt backups at rest\n- **NIST RC.RP-1** (Recovery Plan): ${hasRecovery ? "Implemented" : "NOT IMPLEMENTED — remediate immediately"}\n- **NIST DE.CM-1** (Continuous Monitoring): Detect encryption anomalies\n\n**Recommended Actions:**\n1. Maintain 3-2-1 backup strategy (3 copies, 2 media types, 1 offsite immutable)\n2. Test backup restoration quarterly — verify RTO 4h / RPO 1h\n3. Segment network to limit lateral movement (micro-segmentation)\n4. Implement application whitelisting on critical servers\n5. Deploy email sandboxing for attachment detonation\n6. Conduct tabletop exercise simulating LockBit-style attack`;
  }

  if (has(["phishing", "social engineering", "spear phish", "baiting", "pretexting", "tailgating"])) {
    const hasMfa = isoControls.some(c => c.controlId === "A.5.15" && c.status !== "NOT_IMPLEMENTED");
    return `### Social Engineering & Phishing — Threat Advisory\n\n**What it is:**\nSocial engineering exploits human psychology rather than technical vulnerabilities. Phishing is the most prevalent variant, where attackers impersonate trusted entities to trick users into:\n\n- **Email Phishing:** Mass-distributed emails mimicking banks, IT support, or SaaS providers\n- **Spear Phishing:** Targeted attacks using personal information (LinkedIn, corporate directory)\n- **Whaling:** Attacks targeting C-suite executives with legal/financial pretexts\n- **Business Email Compromise (BEC):** CEO fraud, vendor impersonation, wire transfer redirection\n- **Vishing/Smishing:** Voice calls and SMS-based phishing\n\n**Attack Vectors:**\n1. Malicious attachments (macro-enabled Office docs, ISO files, OneNote exploits)\n2. Credential harvesting pages (OAuth consent phishing, fake SSO portals)\n3. QR code phishing (quishing) — bypasses email security gateways\n4. AI-generated deepfake audio for vishing attacks\n\n**Risk to your environment:**\n- MFA enforcement (A.5.15): ${hasMfa ? "Partially implemented — some accounts may lack MFA" : "NOT IMPLEMENTED — high risk of credential compromise"}\n- Your contractor portal lacks MFA enforcement (identified risk rsk-003)\n- ${critCount} critical risks could be exploited via social engineering entry points\n\n**Relevant Controls:**\n- **ISO 27001 A.5.15** (Access Control): ${hasMfa ? "Partially implemented" : "NOT IMPLEMENTED"}\n- **ISO 27001 A.6.3** (Information Security Awareness): Training programs\n- **NIST PR.AC-1** (Identity Management): Credential hygiene\n\n**Recommended Actions:**\n1. Enforce phishing-resistant MFA (FIDO2/WebAuthn) across all accounts\n2. Deploy advanced email security with URL detonation and attachment sandboxing\n3. Conduct monthly simulated phishing campaigns with metrics tracking\n4. Implement DMARC/DKIM/SPF to prevent domain spoofing\n5. Establish clear reporting procedures for suspicious emails (phish alert button)`;
  }

  if (has(["malware", "trojan", "virus", "worm", "rootkit", "botnet"])) {
    return `### Malware — Threat Advisory\n\n**What it is:**\nMalware (malicious software) is an umbrella term for any code designed to damage, disrupt, or gain unauthorized access to systems. Major categories:\n\n- **Trojans:** Disguised as legitimate software (e.g., fake VPN clients, pirated tools)\n- **Worms:** Self-propagating across networks without user interaction (WannaCry, NotPetya)\n- **Rootkits:** Kernel-level persistence that hides from OS and security tools\n- **Fileless Malware:** Lives in memory only — evades traditional AV (PowerShell Empire, Cobalt Strike)\n- **RATs (Remote Access Trojans):** Provide persistent C2 access (njRAT, DarkComet)\n\n**Detection Methods:**\n1. Signature-based AV (limited against polymorphic threats)\n2. Behavioral analysis (process injection, API hooking, fileless execution)\n3. EDR telemetry (process tree analysis, memory scanning)\n4. Network indicators (DNS anomalies, beaconing patterns)\n5. File integrity monitoring (unexpected binary modifications)\n\n**Your Environment:**\n- ${assets.length} assets monitored, ${criticalAssets.length} rated Critical\n- Endpoint controls: Verify A.7.10 and A.8.8 are addressing malware prevention\n\n**Recommended Actions:**\n1. Deploy next-gen EDR with memory scanning and behavioral detection\n2. Enable ASR (Attack Surface Reduction) rules on Windows endpoints\n3. Implement application control policies (AppLocker, WDAC)\n4. Monitor for fileless execution via PowerShell Constrained Language Mode\n5. Establish malware analysis sandbox for suspicious samples`;
  }

  if (has(["ddos", "denial of service", "dos attack", "volumetric", "application layer"])) {
    const hasRateLimit = isoControls.some(c => c.controlId === "A.8.20" && c.status !== "NOT_IMPLEMENTED");
    return `### DDoS (Distributed Denial of Service) — Threat Advisory\n\n**What it is:**\nA DDoS attack overwhelms a target system with traffic from multiple distributed sources, rendering services unavailable to legitimate users. Modern DDoS attacks often combine multiple vectors simultaneously.\n\n**Attack Categories:**\n1. **Volumetric (L3/L4):** UDP flood, DNS amplification, memcached reflection — measured in Gbps\n2. **Protocol (L3/L4):** SYN flood, Ping of Death, Smurf attack — exhausts network stack\n3. **Application Layer (L7):** HTTP flood, Slowloris, REST API abuse — targets application logic\n\n**Modern Trends:**\n- Multi-vector attacks combining volumetric + application layer\n- IoT botnet-powered (Mirai variants: 100K+ devices)\n- Ransom DDoS (Extortion) — threaten attack unless paid\n- Cloud-burst attacks leveraging auto-scaling to cause bill shock\n\n**Your Environment:**\n- Payment API (ast-104) previously targeted with 14,000 failed auth attempts\n- Rate limiting: ${hasRateLimit ? "A.8.20 partially implemented" : "A.8.20 NOT IMPLEMENTED — API endpoints unprotected"}\n\n**Relevant Controls:**\n- **ISO 27001 A.8.20** (Network Security): ${hasRateLimit ? "Partially implemented" : "NOT IMPLEMENTED"}\n- **NIST PR.DS-5** (Data Security): Protections against DDoS data loss\n\n**Recommended Actions:**\n1. Deploy CDN with DDoS mitigation (Cloudflare Enterprise, AWS Shield Advanced)\n2. Implement rate limiting with token bucket algorithm on all API endpoints\n3. Configure auto-scaling thresholds to absorb volumetric attacks\n4. Enable geographic filtering for traffic from unexpected regions\n5. Establish DDoS response playbook with ISP escalation procedures`;
  }

  if (has(["insider threat", "insider attack", "malicious insider", "employee threat"])) {
    return `### Insider Threat — Advisory\n\n**What it is:**\nAn insider threat originates from individuals with legitimate access — employees, contractors, or partners — who intentionally or unintentionally compromise security. The 2024 Verizon DBIR reports 15% of breaches involve internal actors.\n\n**Types:**\n1. **Malicious Insider:** Intentional data theft, sabotage, or fraud (disgruntled employee, corporate espionage)\n2. **Negligent Insider:** Accidental data exposure, weak passwords, falling for phishing\n3. **Compromised Insider:** Legitimate credentials hijacked via credential theft or social engineering\n\n**Key Indicators:**\n- Unusual data access patterns (accessing files outside normal role)\n- After-hours system activity from normally 9-5 accounts\n- Bulk downloads, USB transfers, or cloud upload anomalies\n- Access attempts to restricted systems following disciplinary action\n- Shadow IT usage and unauthorized SaaS applications\n\n**Your Environment:**\n- Endpoint DLP (A.7.10): Identified risk (rsk-005) for remote laptop USB restrictions\n- Access control (A.5.15): ${isoControls.some(c => c.controlId === "A.5.15" && c.status === "FULLY_IMPLEMENTED") ? "Implemented" : "Needs improvement"}\n\n**Recommended Actions:**\n1. Implement User and Entity Behavior Analytics (UEBA) for anomaly detection\n2. Deploy DLP with content inspection on endpoint and network\n3. Enforce least-privilege access with quarterly access reviews\n4. Monitor privileged account activity with PAM solution\n5. Establish insider threat program with HR, Legal, and Security collaboration`;
  }

  if (has(["apt", "advanced persistent threat", "state sponsored", "nation state"])) {
    return `### APT (Advanced Persistent Threat) — Advisory\n\n**What it is:**\nAPTs are sophisticated, long-term cyber campaigns typically conducted by nation-state actors or well-funded criminal organizations. Unlike opportunistic attacks, APTs are strategic, patient, and targeted.\n\n**Kill Chain (Lockheed Martin):**\n1. **Reconnaissance:** OSINT, LinkedIn profiling, DNS enumeration\n2. **Weaponization:** Custom exploit development, supply chain compromise\n3. **Delivery:** Spear phishing, watering hole attacks, zero-day exploits\n4. **Exploitation:** Fileless techniques, living-off-the-land binaries\n5. **Installation:** Rootkits, web shells, registry persistence\n6. **C2:** Encrypted channels, DNS tunneling, legitimate cloud services\n7. **Actions on Objectives:** Data exfiltration, lateral movement, credential harvesting\n\n**Notable APT Groups:** APT29 (Cozy Bear), APT28 (Fancy Bear), Lazarus Group, APT41\n\n**Your Environment:**\n- ${critCount} critical risks and ${openIncidents} active incidents require continuous monitoring\n- NIST DE.CM-1 (Continuous Monitoring): ${nistControls.some(c => c.controlId === "DE.CM-1" && c.status === "FULLY_IMPLEMENTED") ? "Implemented" : "Gap exists — APT detection relies on robust monitoring"}\n\n**Recommended Actions:**\n1. Deploy SIEM with advanced threat hunting queries (Sigma rules)\n2. Implement network detection and response (NDR) for lateral movement\n3. Enable MITRE ATT&CK-mapped detection rules across kill chain\n4. Conduct threat hunting exercises quarterly\n5. Participate in sector-specific ISAC threat intelligence sharing`;
  }

  if (has(["zero day", "zero-day", "0-day", "novel exploit", "unknown vulnerability"])) {
    return `### Zero-Day Exploits — Advisory\n\n**What it is:**\nA zero-day exploit targets a previously unknown vulnerability in software, hardware, or firmware before a patch is available. The term "zero-day" refers to the developer having zero days to fix the issue before it is actively exploited.\n\n**Market Dynamics:**\n- Zero-day exploits are traded on underground markets for $50K-$2.5M depending on target\n- Government agencies (NSA, GCHQ) maintain zero-day stockpiles for offensive operations\n- Commercial surveillance vendors (NSO Group, Candiru) sell zero-day chains as-a-service\n\n**Defense in Depth Against Zero-Days:**\n1. **Virtual Patching:** WAF rules that block exploit patterns before patch availability\n2. **Behavioral Detection:** EDR that detects exploit behavior (process injection, memory corruption)\n3. **Application Sandboxing:** Isolate high-risk applications (browsers, email clients)\n4. **Network Segmentation:** Limit blast radius of successful exploitation\n5. **Threat Intelligence:** Subscribe to CISA KEV catalog and vendor security advisories\n\n**Your Environment:**\n- Vulnerability management (A.8.8): ${isoControls.some(c => c.controlId === "A.8.8" && c.status === "FULLY_IMPLEMENTED") ? "Implemented — ensure weekly scanning captures new CVEs" : "Gap exists — critical for zero-day defense"}\n- Your K8s ingress controller (ast-101) has known CVE-2026-1940 — while not zero-day, demonstrates patch management importance\n\n**Recommended Actions:**\n1. Subscribe to CISA KEV and vendor security bulletins\n2. Deploy virtual patching via WAF for critical assets\n3. Implement exploit protection (EMET, Windows Exploit Guard)\n4. Maintain golden image with rapid patch deployment capability\n5. Conduct purple team exercises simulating zero-day scenarios`;
  }

  if (has(["man in the middle", "mitm", "interception", "arp spoofing", "dns spoofing", "ssl stripping"])) {
    return `### Man-in-the-Middle (MitM) Attack — Advisory\n\n**What it is:**\nA MitM attack intercepts communication between two parties without their knowledge, enabling the attacker to eavesdrop, modify, or inject data into the session. Attackers position themselves between the victim and the resource they are trying to access.\n\n**Common Techniques:**\n1. **ARP Spoofing:** Poisoning local network ARP tables to redirect traffic on LAN\n2. **DNS Spoofing:** Redirecting DNS queries to malicious servers\n3. **SSL Stripping:** Downgrading HTTPS to HTTP to intercept encrypted traffic\n4. **Rogue Wi-Fi:** Evil twin access points in public locations\n5. **BGP Hijacking:** Manipulating internet routing to redirect traffic at ISP level\n\n**Risk to your environment:**\n- TLS enforcement (A.8.24): ${isoControls.some(c => c.controlId === "A.8.24" && c.status === "FULLY_IMPLEMENTED") ? "Implemented — TLS 1.3 enforced on external endpoints" : "Gap exists — MitM risk increases without encryption enforcement"}\n- Payment API traffic is high-value target for MitM interception\n\n**Recommended Actions:**\n1. Enforce TLS 1.3 on all endpoints, disable TLS 1.0/1.1\n2. Implement HSTS (HTTP Strict Transport Security) with preloading\n3. Deploy certificate pinning for mobile applications\n4. Enable DNSSEC for domain resolution integrity\n5. Use mutual TLS (mTLS) for service-to-service communication`;
  }

  if (has(["firewall", "waf", "network security", "segmentation", "ids", "ips", "network access control"])) {
    return `### Network Security & Firewalls — Advisory\n\n**What it is:**\nNetwork security encompasses policies, hardware, and software that protect network infrastructure and data from unauthorized access, misuse, and attacks. Firewalls are the primary perimeter defense.\n\n**Firewall Types:**\n1. **Packet Filtering:** Inspects headers (source/dest IP, port) — fast but limited\n2. **Stateful Inspection:** Tracks connection state — handles dynamic protocols\n3. **Next-Gen (NGFW):** Deep packet inspection, application awareness, IPS integration\n4. **Web Application Firewall (WAF):** HTTP/HTTPS-specific protection (OWASP Top 10)\n\n**Network Segmentation Model:**\n- **DMZ:** Public-facing services (web servers, reverse proxies)\n- **Application Tier:** Backend services, APIs, microservices\n- **Data Tier:** Databases, file stores — strictest access controls\n- **Management Network:** Out-of-band management, jump boxes\n\n**Your Environment:**\n- Payment API (ast-104): Previously targeted with 14K failed auth attempts — WAF rate limiting critical\n- K8s Ingress (ast-101): Network policies required for pod-to-pod communication\n\n**Recommended Actions:**\n1. Deploy NGFW with application-level inspection at network perimeter\n2. Implement micro-segmentation in Kubernetes using Calico/Cilium network policies\n3. Enable WAF with OWASP CRS on all web-facing services\n4. Deploy IDS/IPS (Suricata, Snort) for network anomaly detection\n5. Conduct network architecture review and establish zero-trust segmentation`;
  }

  if (has(["vulnerability", "scan", "pentest", "cve", "patch", "vulnerability assessment", "vulnerability management"])) {
    const hasVulnMgmt = isoControls.some(c => c.controlId === "A.8.8" && c.status === "FULLY_IMPLEMENTED");
    return `### Vulnerability Management — Advisory\n\n**What it is:**\nVulnerability management is the continuous process of identifying, classifying, prioritizing, and remediating security weaknesses in software, hardware, and configurations. It is a proactive defense against exploitation.\n\n**Process Lifecycle:**\n1. **Discovery:** Automated scanning (Tenable, Qualys, Rapid7) + manual pentesting\n2. **Assessment:** CVSS scoring, environmental context, exploitability analysis\n3. **Prioritization:** Risk-based prioritization (not just CVSS — consider asset criticality)\n4. **Remediation:** Patching, configuration changes, compensating controls\n5. **Verification:** Re-scan to confirm remediation effectiveness\n\n**CVSS v3.1 Scoring:**\n- Critical (9.0-10.0): Patch within 24-48 hours\n- High (7.0-8.9): Patch within 7 days\n- Medium (4.0-6.9): Patch within 30 days\n- Low (0.1-3.9): Patch within 90 days\n\n**Your Environment:**\n- A.8.8 (Management of Technical Vulnerabilities): ${hasVulnMgmt ? "FULLY IMPLEMENTED — weekly Tenable scans active" : "NOT IMPLEMENTED — no automated scanning in place"}\n- Known vulnerability: CVE-2026-1940 in K8s Ingress Controller (Critical)\n- Vulnerability SLA: High/Critical within 7 days\n\n**Recommended Actions:**\n1. Run authenticated vulnerability scans weekly on all assets\n2. Prioritize remediation by: (a) exploitability, (b) asset criticality, (c) CVSS score\n3. Establish SLA: Critical 24h, High 7d, Medium 30d, Low 90d\n4. Implement virtual patching via WAF for zero-day and unpatchable systems\n5. Track remediation metrics in GRC platform — report monthly to leadership`;
  }

  if (has(["mfa", "multi-factor", "authentication", "sso", "okta", "password", "credential", "login"])) {
    const hasMfa = isoControls.some(c => c.controlId === "A.5.15" && c.status !== "NOT_IMPLEMENTED");
    return `### Authentication & MFA — Advisory\n\n**What it is:**\nAuthentication verifies the identity of users, devices, or systems. Multi-Factor Authentication (MFA) requires two or more independent verification factors, dramatically reducing the risk of credential compromise.\n\n**Authentication Factors:**\n1. **Knowledge:** Password, PIN, security questions\n2. **Possession:** Hardware token (YubiKey), mobile app (TOTP), smart card\n3. **Inherence:** Biometrics — fingerprint, face, iris, voice\n\n**MFA Methods (Strongest to Weakest):**\n1. **FIDO2/WebAuthn:** Phishing-resistant, hardware-bound (YubiKey 5)\n2. **Passkeys:** Platform-native (Apple, Google, Microsoft) — phishing-resistant\n3. **TOTP:** Time-based OTP (Google Authenticator, Authy) — susceptible to real-time phishing\n4. **SMS/Voice OTP:** Vulnerable to SIM-swapping — avoid for high-risk accounts\n\n**Your Environment:**\n- Contractor portal (ast-103): **CRITICAL GAP** — single-factor authentication for staging environment\n- SSO Implementation: Okta SSO active for 90% of core applications\n- A.5.15 (Access Control): ${hasMfa ? "Partially implemented — contractor portal still exposed" : "NOT IMPLEMENTED"}\n\n**Recommended Actions:**\n1. Enforce FIDO2/WebAuthn MFA for all privileged accounts immediately\n2. Migrate contractor portal to Okta SSO with mandatory WebAuthn\n3. Implement conditional access policies (device compliance, location, risk level)\n4. Deploy passwordless authentication roadmap (passkeys)\n5. Implement breached credential monitoring (HaveIBeenPwned API integration)`;
  }

  if (has(["zero trust", "zero-trust", "never trust"])) {
    return `### Zero Trust Architecture — Advisory\n\n**What it is:**\nZero Trust is a security model that operates on the principle of "never trust, always verify." Unlike traditional perimeter-based security, Zero Trust assumes no user, device, or network segment is inherently trustworthy — every access request must be authenticated, authorized, and encrypted.\n\n**Core Principles (NIST SP 800-207):**\n1. **Verify Explicitly:** Authenticate and authorize based on all available data points\n2. **Least Privilege Access:** Grant minimum permissions needed for the task\n3. **Assume Breach:** Design as if the attacker is already inside the network\n\n**Implementation Pillars:**\n- **Identity:** Strong MFA, conditional access, just-in-time access\n- **Device:** Endpoint compliance, health attestation, certificate-based auth\n- **Network:** Micro-segmentation, encrypted tunnels, no implicit trust\n- **Application:** Workload identity, API gateway authorization\n- **Data:** Classification, encryption, DLP\n\n**Your Environment:**\n- You have partial Zero Trust elements: Okta SSO for most apps, K8s network policies needed\n- Gaps: Contractor portal lacks MFA, network segmentation is limited\n\n**Recommended Actions:**\n1. Deploy identity-aware proxy (BeyondCorp, Zscaler Private Access)\n2. Implement micro-segmentation across all network tiers\n3. Enforce device compliance checks before granting access\n4. Adopt just-in-time (JIT) privileged access management\n5. Map current controls to Zero Trust maturity model and set 12-month roadmap`;
  }

  if (has(["backup", "disaster recovery", "business continuity", "bcp", "dr plan", "recovery"])) {
    const hasRecovery = nistControls.some(c => c.controlId === "RC.RP-1" && c.status === "FULLY_IMPLEMENTED");
    return `### Disaster Recovery & Business Continuity — Advisory\n\n**What it is:**\nBusiness Continuity Planning (BCP) ensures critical operations continue during and after disruptive events. Disaster Recovery (DR) is the technical subset focused on restoring IT systems and data.\n\n**Key Metrics:**\n- **RTO (Recovery Time Objective):** Maximum acceptable downtime\n- **RPO (Recovery Point Objective):** Maximum acceptable data loss (in time)\n- **MTTR (Mean Time to Repair):** Average time to restore service\n\n**3-2-1 Backup Rule:**\n- 3 copies of data (1 primary + 2 backups)\n- 2 different media types (disk + cloud/tape)\n- 1 offsite copy (air-gapped or immutable)\n\n**Your Environment:**\n- NIST RC.RP-1 (Recovery Plan): ${hasRecovery ? "FULLY IMPLEMENTED — RTO 4h / RPO 1h verified in June 2026 drill" : "NOT IMPLEMENTED — no tested recovery plan in place"}\n- Database Backup (ast-102): Risk identified for unencrypted backups in secondary S3\n\n**Recommended Actions:**\n1. Implement immutable backups (S3 Object Lock / Azure immutable blob)\n2. Test DR recovery quarterly with documented results\n3. Automate backup verification with checksum validation\n4. Establish secondary region warm standby for critical workloads\n5. Document and rehearse communication plan for DR scenarios`;
  }

  if (has(["siem", "monitoring", "logging", "detection", "alerting", "log management", "soc"])) {
    const hasMonitoring = nistControls.some(c => c.controlId === "DE.CM-1" && c.status === "FULLY_IMPLEMENTED");
    return `### SIEM & Security Monitoring — Advisory\n\n**What it is:**\nSecurity Information and Event Management (SIEM) aggregates and analyzes log data from across the environment to detect threats, generate alerts, and support incident investigation. Effective monitoring is the foundation of detection and response.\n\n**Data Sources to Aggregate:**\n- Endpoint: EDR alerts, process creation, PowerShell execution\n- Network: Firewall logs, DNS queries, NetFlow, IDS alerts\n- Identity: Authentication events, privilege escalation, group changes\n- Cloud: CloudTrail, GuardDuty, Azure Sentinel, GCP SCC\n- Application: WAF logs, API access logs, database audit logs\n\n**Detection Engineering (MITRE Mapped):**\n- Create Sigma rules for behavioral detection\n- Map detection rules to MITRE ATT&CK techniques\n- Maintain detection coverage metrics by tactic\n\n**Your Environment:**\n- NIST DE.CM-1 (Continuous Monitoring): ${hasMonitoring ? "FULLY IMPLEMENTED — Datadog SIEM + AWS GuardDuty active" : "NOT IMPLEMENTED — no centralized monitoring"}\n- Datadog SIEM integrated with 24/7 SOC alerting\n\n**Recommended Actions:**\n1. Onboard all critical asset logs to SIEM within 30 days\n2. Create detection rules for top 20 MITRE ATT&CK techniques\n3. Establish alert triage procedures with severity-based SLAs\n4. Implement automated response playbooks (SOAR integration)\n5. Conduct monthly detection engineering reviews`;
  }

  if (has(["access control", "rbac", "least privilege", "iam", "identity", "authorization", "privilege"])) {
    const hasAccessControl = isoControls.some(c => c.controlId === "A.5.15" && c.status === "FULLY_IMPLEMENTED");
    return `### Access Control & Identity Management — Advisory\n\n**What it is:**\nAccess control ensures that only authorized users, processes, or systems can access specific resources. The principle of least privilege (PoLP) dictates that entities should have only the minimum permissions necessary to perform their function.\n\n**Access Control Models:**\n- **RBAC (Role-Based):** Permissions assigned to roles, users inherit roles\n- **ABAC (Attribute-Based):** Decisions based on user/resource/environment attributes\n- **MAC (Mandatory):** System-enforced labels (military/government)\n- **DAC (Discretionary):** Resource owner controls access\n\n**Your Environment:**\n- A.5.15 (Access Control): ${hasAccessControl ? "FULLY IMPLEMENTED — Okta SSO with SCIM provisioning" : "PARTIALLY IMPLEMENTED — gaps in contractor access"}\n- Okta SCIM provisioning active for 85% of software assets\n- ${criticalAssets.length} critical assets require strict access controls\n\n**Recommended Actions:**\n1. Conduct quarterly access reviews — remove orphaned accounts\n2. Implement just-in-time (JIT) access for privileged operations\n3. Enforce separation of duties for critical functions\n4. Deploy PAM solution for privileged credential vaulting and session recording\n5. Implement automated deprovisioning on employee termination (HR-IT integration)`;
  }

  if (has(["security policy", "governance", "policy", "procedure", "standard", "guideline"])) {
    const hasPolicy = isoControls.some(c => c.controlId === "A.5.1" && c.status === "FULLY_IMPLEMENTED");
    return `### Security Policy & Governance — Advisory\n\n**What it is:**\nInformation security governance establishes the framework for directing and controlling cybersecurity efforts. Policies, standards, procedures, and guidelines form the governance documentation hierarchy.\n\n**Policy Hierarchy:**\n1. **Policy:** High-level mandate approved by executive leadership\n2. **Standards:** Mandatory requirements (encryption standards, password rules)\n3. **Procedures:** Step-by-step instructions for implementing standards\n4. **Guidelines:** Recommended practices (flexible, not mandatory)\n\n**Key Policies Required for ISO 27001:**\n- Information Security Policy (A.5.1)\n- Access Control Policy (A.5.15)\n- Cryptographic Policy (A.8.24)\n- Incident Management Policy (A.5.24)\n- Supplier Security Policy (A.5.19)\n\n**Your Environment:**\n- A.5.1 (Policies for Information Security): ${hasPolicy ? "FULLY IMPLEMENTED — policy published on Confluence, signed off by Board" : "NOT IMPLEMENTED — foundational gap for compliance"}\n\n**Recommended Actions:**\n1. Maintain master policy register with annual review schedule\n2. Obtain executive sign-off for all tier-1 policies\n3. Implement policy awareness training with acknowledgment tracking\n4. Map policies to ISO 27001 Annex A controls for audit readiness\n5. Conduct policy gap analysis against NIST CSF 2.0 and SOC 2 criteria`;
  }

  if (has(["security awareness", "training", "user education", "phishing awareness", "security culture"])) {
    return `### Security Awareness Training — Advisory\n\n**What it is:**\nSecurity awareness training educates employees about cybersecurity threats, safe practices, and their role in protecting organizational assets. Human error remains the #1 factor in breaches (Verizon DBIR 2024: 68% involve human element).\n\n**Training Program Components:**\n1. **Onboarding Training:** Security fundamentals for new hires\n2. **Annual Refresher:** Updated threat landscape, policy changes\n3. **Role-Based Training:** Developers (secure coding), finance (BEC awareness), admins (privileged access)\n4. **Simulated Phishing:** Monthly campaigns with difficulty escalation\n5. **Tabletop Exercises:** Incident response scenarios for leadership\n\n**Metrics to Track:**\n- Phishing simulation click rate (target: <5%)\n- Training completion rate (target: 100%)\n- Time to report suspicious email\n- Security incident root cause attribution to human error\n\n**Your Environment:**\n- ISO 27001 A.6.3 (Information Security Awareness): Verify training program is active\n- Contractor portal users may lack organizational security training\n\n**Recommended Actions:**\n1. Deploy monthly phishing simulations with real-world scenarios\n2. Implement just-in-time training for users who fail simulations\n3. Gamify security training with leaderboards and recognition\n4. Include secure coding training for all developers (OWASP Top 10)\n5. Conduct quarterly tabletop exercises with incident response team`;
  }

  if (has(["endpoint", "edr", "antivirus", "endpoint protection", "device security", "mdm"])) {
    return `### Endpoint Security — Advisory\n\n**What it is:**\nEndpoint security protects individual devices (laptops, desktops, servers, mobile) from threats. Modern endpoint detection and response (EDR) goes beyond traditional antivirus by monitoring behavior, not just signatures.\n\n**Evolution:**\n1. **Antivirus (AV):** Signature-based — detects known malware only\n2. **Anti-malware:** Adds heuristic and behavioral analysis\n3. **EDR (Endpoint Detection & Response):** Real-time monitoring, threat hunting, forensic analysis\n4. **XDR (Extended Detection & Response):** Correlates endpoint + network + cloud telemetry\n\n**Your Environment:**\n- A.7.10 (Storage Media): Identified risk (rsk-005) — remote developer laptops allow unrestricted USB devices\n- CrowdStrike Endpoint Protection with USB policy restriction recommended\n\n**Recommended Actions:**\n1. Deploy EDR on all endpoints (CrowdStrike Falcon, SentinelOne, or Microsoft Defender for Endpoint)\n2. Enable Attack Surface Reduction (ASR) rules\n3. Implement application whitelisting on critical servers\n4. Enforce MDM policies: disk encryption, screen lock, jailbreak detection\n5. Monitor for fileless malware execution (PowerShell, WMI abuse)`;
  }

  if (has(["cloud security", "aws", "azure", "kubernetes", "k8s", "docker", "container", "eks", "aks"])) {
    return `### Cloud & Container Security — Advisory\n\n**What it is:**\nCloud security encompasses policies, controls, and technologies protecting cloud-based infrastructure, applications, and data. Container security extends this to Docker, Kubernetes, and orchestration platforms.\n\n**Cloud Security Shared Responsibility:**\n- **Cloud Provider:** Physical security, hypervisor, network infrastructure\n- **Customer:** Data, identity, application configuration, OS patching\n\n**Kubernetes Security Risks:**\n1. **Misconfigured RBAC:** Overly permissive service accounts\n2. **Exposed Dashboard:** Kubernetes API server without auth\n3. **Container Escape:** Kernel vulnerabilities allowing host access\n4. **Supply Chain:** Malicious images from public registries\n5. **Secrets Management:** Hardcoded credentials in YAML manifests\n\n**Your Environment:**\n- Production K8s Cluster (ast-101): CRITICAL risk — unpatched Ingress Controller (CVE-2026-1940)\n- ${criticalAssets.length} critical cloud assets require enhanced monitoring\n\n**Recommended Actions:**\n1. Implement pod security standards (restricted profile)\n2. Scan container images for vulnerabilities (Trivy, Snyk)\n3. Enable Kubernetes audit logging to SIEM\n4. Use network policies to restrict pod-to-pod communication\n5. Store secrets in AWS Secrets Manager / HashiCorp Vault — never in YAML\n6. Conduct K8s security audit against CIS Benchmark`;
  }

  if (has(["api security", "microservice", "rest", "graphql", "web service"])) {
    return `### API Security — Advisory\n\n**What it is:**\nAPI security protects application programming interfaces from abuse, data breaches, and unauthorized access. APIs are the #1 attack vector for web applications (OWASP API Security Top 10).\n\n**Common API Vulnerabilities (OWASP API Top 10):**\n1. **BOLA (Broken Object Level Authorization):** Accessing other users' data via ID manipulation\n2. **Broken Authentication:** Weak token validation, missing rate limiting\n3. **Excessive Data Exposure:** Returning more data than the client needs\n4. **Lack of Rate Limiting:** Enabling brute-force and DDoS attacks\n5. **SSRF (Server-Side Request Forgery):** Abusing API to access internal resources\n\n**Your Environment:**\n- Payment Gateway API (ast-104): Previously targeted with 14K failed auth attempts\n- A.8.20 (Network Security): Rate limiting needs enforcement\n\n**Recommended Actions:**\n1. Implement OAuth 2.0 with short-lived JWT tokens\n2. Deploy API gateway with rate limiting and request validation\n3. Use schema validation (OpenAPI spec enforcement)\n4. Implement API key rotation and scope restriction\n5. Monitor API traffic for anomalies (response time, error rates, payload size)`;
  }

  if (has(["data protection", "data privacy", "data loss prevention", "dlp", "pii", "data classification"])) {
    return `### Data Protection & DLP — Advisory\n\n**What it is:**\nData protection ensures sensitive information is collected, processed, stored, and transmitted securely. Data Loss Prevention (DLP) technologies detect and prevent unauthorized data exfiltration.\n\n**Data Classification Levels:**\n- **Public:** Marketing materials, published content\n- **Internal:** Internal memos, non-sensitive operational data\n- **Confidential:** Financial records, customer data, contracts\n- **Restricted:** PII, PHI, payment card data, trade secrets\n\n**DLP Detection Methods:**\n1. **Content Inspection:** Pattern matching (SSN, credit card regex)\n2. **Context Analysis:** User behavior, destination, volume\n3. **Endpoint DLP:** USB blocking, clipboard monitoring, print control\n4. **Network DLP:** Email gateway, web proxy, cloud app monitoring\n\n**Your Environment:**\n- A.8.12 (DLP): ${isoControls.some(c => c.controlId === "A.8.12" && c.status === "FULLY_IMPLEMENTED") ? "Implemented — Cloud DLP active in Google Workspace and Salesforce" : "NOT IMPLEMENTED — no data exfiltration controls"}\n- A.7.10 (Endpoint): USB restrictions needed for remote laptops\n\n**Recommended Actions:**\n1. Classify all data assets by sensitivity level\n2. Deploy DLP rules for PII patterns (SSN, credit cards, API keys)\n3. Block USB storage devices on corporate endpoints\n4. Monitor cloud app usage for unsanctioned SaaS (shadow IT)\n5. Implement data retention and destruction policies`;
  }

  if (has(["iso 27001", "iso27001", "iso", "27001", "compliance", "audit", "certification", "isms", "soa", "statement of applicability"])) {
    const fullyImplemented = isoControls.filter(c => c.status === "FULLY_IMPLEMENTED").length;
    return `### ISO 27001:2022 Compliance Status\n\n**Your Readiness Score:** ${isoScore}%\n\n**Control Breakdown:**\n- FULLY IMPLEMENTED: ${fullyImplemented}/${isoControls.length}\n- PARTIALLY IMPLEMENTED: ${partialIso.length}\n- NOT IMPLEMENTED: ${notImplIso.length}\n\n${notImplIso.length > 0 ? `**Controls Needing Remediation:**\n${notImplIso.map(c => `- **${c.controlId}** (${c.title}): ${c.status}`).join("\n")}\n\n` : ""}${partialIso.length > 0 ? `**Partially Implemented Controls:**\n${partialIso.map(c => `- **${c.controlId}** (${c.title}): ${c.notes || "In progress"}`).join("\n")}\n\n` : ""}**ISO 27001:2022 Annex A Control Categories:**\n- Organizational Controls (A.5): 37 controls\n- People Controls (A.6): 8 controls\n- Physical Controls (A.7): 14 controls\n- Technological Controls (A.8): 34 controls\n\n**Certification Path:**\n1. Close ${notImplIso.length} NOT_IMPLEMENTED gaps\n2. Update Statement of Applicability (SoA)\n3. Conduct internal audit across all domains\n4. Perform management review with risk treatment plan\n5. Stage 1 audit (documentation review) then Stage 2 audit (implementation)\n\n**Priority Remediation:** Focus on access control (A.5.15), vulnerability management (A.8.8), and supplier relationships (A.5.19).`;
  }

  if (has(["nist", "csf", "framework", "nist csf"])) {
    const fullyImpl = nistControls.filter(c => c.status === "FULLY_IMPLEMENTED").length;
    return `### NIST CSF 2.0 Framework Status\n\n**Your Maturity Score:** ${nistScore}%\n\n**Control Breakdown:**\n- FULLY IMPLEMENTED: ${fullyImpl}/${nistControls.length}\n- PARTIALLY IMPLEMENTED: ${partialNist.length}\n- NOT IMPLEMENTED: ${notImplNist.length}\n\n**Function-Level Assessment:**\n${nistControls.map(c => `- **${c.controlId}** (${c.title}): ${c.status.replace("_", " ")}`).join("\n")}\n\n**NIST CSF 2.0 Six Functions:**\n1. **GOVERN (GV):** Establish cybersecurity strategy and policy\n2. **IDENTIFY (ID):** Asset management, risk assessment\n3. **PROTECT (PR):** Access control, data security, maintenance\n4. **DETECT (DE):** Anomalies, security monitoring, adverse events\n5. **RESPOND (RS):** Incident management, analysis, mitigation\n6. **RECOVER (RC):** Recovery planning, improvements, communications\n\n**Maturity Levels (CMMC Alignment):**\n- Tier 1 (Partial): Ad hoc practices\n- Tier 2 (Risk-Informed): Risk-informed but not org-wide\n- Tier 3 (Repeatable): Formal policies, regularly reviewed\n- Tier 4 (Adaptive): Continuous improvement, threat-adaptive\n\n**Priority:** Address ${notImplNist.length} NOT_IMPLEMENTED functions, particularly in DETECT and RESPOND.`;
  }

  if (has(["soc 2", "soc2", "type ii", "trust services"])) {
    return `### SOC 2 Type II — Advisory\n\n**What it is:**\nSOC 2 (Service Organization Control 2) is an auditing standard developed by AICPA that evaluates an organization's controls based on five Trust Services Criteria. It is the de facto standard for SaaS and cloud service providers.\n\n**Trust Services Criteria:**\n1. **Security (Common Criteria):** Protection against unauthorized access — REQUIRED\n2. **Availability:** System uptime and performance commitments\n3. **Processing Integrity:** System processing is complete, accurate, timely\n4. **Confidentiality:** Protection of designated confidential information\n5. **Privacy:** Personal information collection, use, retention, and disposal\n\n**Mapping to Your Controls:**\n- Security: ISO 27001 A.5-A.8 controls\n- Availability: NIST RC.RP-1 (Recovery), A.8.14 (Redundancy)\n- Confidentiality: A.8.24 (Cryptography), A.8.12 (DLP)\n\n**Your Third-Party Risk:**\n- Analytics SaaS vendor (ast-105): SOC 2 Type II report expired 18+ months — requires reassessment\n\n**Recommended Actions:**\n1. Request updated SOC 2 reports from all critical vendors annually\n2. Map existing ISO 27001 controls to SOC 2 Trust Services Criteria\n3. Address gaps identified in auditor management letter\n4. Implement continuous control monitoring for SOC 2 evidence collection\n5. Consider SOC 2 Type II audit for your own organization if offering B2B SaaS`;
  }

  if (has(["gdpr", "privacy", "data protection regulation", "ccpa", "personal data", "data subject"])) {
    return `### Data Privacy & GDPR — Advisory\n\n**What it is:**\nThe General Data Protection Regulation (GDPR) is the EU's comprehensive data privacy law. Similar regulations include CCPA (California), LGPD (Brazil), and POPIA (South Africa). Non-compliance penalties: up to 4% of annual global turnover or 20M EUR.\n\n**Key GDPR Principles:**\n1. **Lawfulness, Fairness, Transparency:** Clear legal basis for processing\n2. **Purpose Limitation:** Data collected for specified, legitimate purposes\n3. **Data Minimization:** Collect only what is necessary\n4. **Accuracy:** Keep personal data accurate and up to date\n5. **Storage Limitation:** Retain data only as long as necessary\n6. **Integrity and Confidentiality:** Ensure appropriate security measures\n\n**Data Subject Rights:**\n- Right to access (Article 15)\n- Right to erasure / right to be forgotten (Article 17)\n- Right to data portability (Article 20)\n- Right to object to processing (Article 21)\n\n**Your Controls Mapping:**\n- A.8.12 (DLP): Protects personal data from exfiltration\n- A.8.24 (Cryptography): Protects data in transit and at rest\n- A.5.15 (Access Control): Ensures authorized processing only\n\n**Recommended Actions:**\n1. Maintain Record of Processing Activities (ROPA)\n2. Conduct Data Protection Impact Assessment (DPIA) for high-risk processing\n3. Implement data subject request (DSR) workflow\n4. Review third-party data processing agreements (DPAs)\n5. Appoint Data Protection Officer (DPO) if required`;
  }

  if (has(["incident", "breach", "response", "incident response", "incident management"])) {
    const activeIncidents = incidents.filter(i => i.status !== "CLOSED");
    return `### Incident Response — Advisory\n\n**Your Active Incidents:** ${activeIncidents.length}\n${activeIncidents.map(i => `- **${i.title}** (${i.severity}) — Status: ${i.status}`).join("\n")}\n\n**NIST SP 800-61r2 Incident Handling Lifecycle:**\n\n**1. Preparation:**\n- Establish Computer Security Incident Response Team (CSIRT)\n- Develop incident classification matrix (severity vs. scope)\n- Maintain forensic toolkit and evidence chain-of-custody procedures\n\n**2. Detection and Analysis:**\n- Monitor SIEM alerts and correlation rules\n- Validate alerts to eliminate false positives\n- Document timeline and indicators of compromise (IOCs)\n\n**3. Containment, Eradication, Recovery:**\n- **Short-term Containment:** Isolate affected network segments, block malicious IPs\n- **Long-term Containment:** Apply patches, rotate compromised credentials\n- **Eradication:** Remove malware, close attack vectors, rebuild from clean images\n- **Recovery:** Restore from verified backups, validate system integrity\n\n**4. Post-Incident Activity:**\n- Conduct root cause analysis within 48 hours\n- Document lessons learned and update playbooks\n- Share threat intelligence with sector ISAC\n\n**Recommended Actions:**\n1. Update incident response playbook for ransomware, BEC, and data breach scenarios\n2. Conduct quarterly tabletop exercises with cross-functional stakeholders\n3. Establish relationships with forensics firm and legal counsel\n4. Implement automated containment playbooks (SOAR)\n5. Ensure all incidents are documented in the Incident Tracker with full timeline`;
  }

  if (has(["risk", "threat", "scoring", "risk register", "risk assessment", "risk management", "risk analysis"])) {
    return `### Risk Assessment — Current Landscape\n\n**Your Risk Register:** ${risks.length} Identified Risks\n- **CRITICAL (Score 16-25):** ${critCount} risks\n- **HIGH (Score 10-15):** ${highCount} risks\n- **MEDIUM (Score 5-9):** ${risks.filter(r => r.riskScore >= 5 && r.riskScore < 10).length} risks\n- **LOW (Score 1-4):** ${risks.filter(r => r.riskScore < 5).length} risks\n\n**Open Risks Requiring Action:** ${openCount}\n${risks.filter(r => r.status === "OPEN" || r.status === "UNDER_REVIEW").slice(0, 5).map(r => `- **${r.title}** (Score: ${r.riskScore}, Status: ${r.status})`).join("\n")}\n\n**Risk Scoring Methodology (5x5 Matrix):**\nRisk Score = Likelihood (1-5) x Impact (1-5)\n- 16-25: CRITICAL — Immediate executive escalation\n- 10-15: HIGH — Remediate within 7 days\n- 5-9: MEDIUM — Remediate within 30 days\n- 1-4: LOW — Accept or schedule for next quarter\n\n**Risk Treatment Options:**\n1. **Mitigate:** Implement controls to reduce likelihood or impact\n2. **Transfer:** Shift risk to insurance or third-party provider\n3. **Accept:** Formally acknowledge and monitor (for low risks)\n4. **Avoid:** Eliminate the risk-generating activity\n\n**Recommended Actions:**\n1. Review ${critCount} critical risks weekly with risk owners\n2. Update risk register monthly with current status and evidence\n3. Conduct quantitative risk analysis for top 5 risks\n4. Present risk dashboard to board quarterly\n5. Align risk register with ISO 27005 and NIST RMF`;
  }

  if (has(["asset", "inventory", "server", "infrastructure", "device", "system", "environment"])) {
    const byType = assets.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>);
    const byCriticality = assets.reduce((acc, a) => { acc[a.criticality] = (acc[a.criticality] || 0) + 1; return acc; }, {} as Record<string, number>);
    return `### Asset Inventory — Current Overview\n\n**Total Assets Managed:** ${assets.length}\n\n**By Type:**\n${Object.entries(byType).map(([type, count]) => `- ${type.replaceAll("_", " ")}: ${count}`).join("\n")}\n\n**By Criticality:**\n${Object.entries(byCriticality).map(([crit, count]) => `- ${crit}: ${count}`).join("\n")}\n\n**Critical Assets:**\n${criticalAssets.map(a => `- **${a.name}** (${a.type.replaceAll("_", " ")}) — ${a.location}`).join("\n")}\n\n**Asset Management Best Practices:**\n1. Maintain real-time inventory with automated discovery\n2. Classify assets by business criticality and data sensitivity\n3. Assign asset owners and review quarterly\n4. Track asset lifecycle (procurement, deployment, decommission)\n5. Monitor for shadow IT and unauthorized cloud resources\n\n**Recommended Actions:**\n1. Implement automated asset discovery (AWS Config, Azure Resource Graph)\n2. Tag all assets with criticality and owner metadata\n3. Conduct quarterly asset review with department heads\n4. Establish asset risk scoring based on criticality and exposure\n5. Integrate asset inventory with vulnerability management for prioritization`;
  }

  if (has(["what is", "what's", "explain", "define", "tell me about", "describe", "how does", "how do", "meaning of"])) {
    const subject = lower
      .replace(/^(what is|what's|explain|define|tell me about|describe|how does|how do|the|a|an|about)\s*/i, "")
      .replace(/\?$/, "")
      .trim();

    if (has(["keylogger"])) {
      return `**Keylogger:** A surveillance tool that records keyboard inputs to capture sensitive information like passwords and credit card numbers. It can be software-based (installed via phishing) or hardware-based (physical device). Defense: Deploy EDR with behavioral detection, enforce USB restrictions, implement DLP controls.`;
    }

    if (has(["ransomware"])) {
      return `**Ransomware:** Malicious software that encrypts files and demands payment for decryption. Modern variants use "double extortion" — encrypting data AND threatening to leak it. Defense: 3-2-1 backup strategy, network segmentation, EDR behavioral detection, regular DR testing.`;
    }

    if (has(["phishing"])) {
      return `**Phishing:** Social engineering attack where attackers impersonate trusted entities via email, SMS, or voice to steal credentials or deliver malware. Variants include spear phishing (targeted), whaling (executives), and BEC (business email compromise). Defense: Phishing-resistant MFA (FIDO2), email sandboxing, security awareness training.`;
    }

    if (has(["firewall"])) {
      return `**Firewall:** A network security device that monitors and filters incoming/outgoing traffic based on predefined rules. Types include packet filtering, stateful inspection, NGFW (Next-Gen), and WAF (Web Application Firewall). Defense: Deploy NGFW with application awareness, implement network segmentation.`;
    }

    if (has(["encryption"])) {
      return `**Encryption:** The process of converting readable data (plaintext) into unreadable ciphertext using mathematical algorithms and keys. AES-256 for data at rest, TLS 1.3 for data in transit. Defense: Enforce encryption everywhere, implement key rotation, use HSM for root key storage.`;
    }

    if (has(["mfa", "multi-factor"])) {
      return `**Multi-Factor Authentication (MFA):** A security mechanism requiring two or more verification factors: something you know (password), something you have (token), something you are (biometric). Phishing-resistant methods include FIDO2/WebAuthn. Defense: Enforce MFA on all accounts, prioritize hardware keys for privileged users.`;
    }

    if (has(["siem"])) {
      return `**SIEM (Security Information and Event Management):** A system that aggregates and analyzes log data from across an organization's IT environment to detect threats, generate alerts, and support compliance. Modern SIEMs use ML for anomaly detection. Defense: Onboard all critical logs, create MITRE-mapped detection rules, establish alert triage procedures.`;
    }

    if (has(["zero trust"])) {
      return `**Zero Trust:** A security model based on "never trust, always verify." Every access request is authenticated regardless of source location. Core principles: verify explicitly, least privilege access, assume breach. Defense: Deploy identity-aware proxy, implement micro-segmentation, enforce device compliance.`;
    }

    if (has(["vulnerability"])) {
      return `**Vulnerability:** A weakness in a system, application, or process that could be exploited by a threat actor. Vulnerabilities are tracked using CVE identifiers and scored using CVSS. Defense: Run weekly automated scans, prioritize by exploitability + asset criticality, establish remediation SLAs.`;
    }

    if (has(["apt"])) {
      return `**APT (Advanced Persistent Threat):** A sophisticated, long-term cyberattack typically conducted by nation-state actors. APTs use multiple stages: reconnaissance, initial access, lateral movement, and data exfiltration. Defense: Deploy SIEM with threat hunting, implement NDR for lateral movement detection, participate in ISAC intelligence sharing.`;
    }

    if (has(["dlp"])) {
      return `**DLP (Data Loss Prevention):** Technologies and processes that detect and prevent unauthorized data exfiltration. DLP monitors data in use (endpoint), in motion (network), and at rest (cloud storage). Defense: Classify data by sensitivity, deploy endpoint DLP for USB/print control, implement network DLP for email/web monitoring.`;
    }

    if (has(["waf"])) {
      return `**WAF (Web Application Firewall):** A security layer that filters, monitors, and blocks HTTP/HTTPS traffic to and from web applications. Protects against OWASP Top 10: SQL injection, XSS, CSRF, etc. Defense: Deploy WAF with OWASP CRS, enable virtual patching for known CVEs, implement rate limiting.`;
    }

    if (subject.length > 2) {
      return `**${subject.charAt(0).toUpperCase() + subject.slice(1)}:** This is an important cybersecurity concept. Proper implementation requires alignment with your ISO 27001 controls and NIST CSF 2.0 framework.\n\nFor detailed guidance:\n1. Check NIST SP 800-53 control catalog for relevant controls\n2. Review MITRE ATT&CK framework for threat context\n3. Consult OWASP guidelines for web application security\n\nWould you like me to map this topic to your current controls and risk posture?`;
    }
  }

  return `I understand you're asking about a cybersecurity topic. Here's context based on your current security posture:\n\n**Your Environment Snapshot:**\n- Open Risks: ${openCount} (${critCount} Critical, ${highCount} High)\n- ISO 27001 Readiness: ${isoScore}% (${notImplIso.length} NOT_IMPLEMENTED controls)\n- NIST CSF 2.0 Maturity: ${nistScore}%\n- Assets Monitored: ${assets.length} (${criticalAssets.length} Critical)\n- Active Incidents: ${openIncidents}\n\n**I can help with:**\n- Threat analysis (keylogger, ransomware, phishing, APT, DDoS)\n- Security concepts (encryption, firewall, MFA, SIEM, Zero Trust)\n- Framework compliance (ISO 27001, NIST CSF 2.0, SOC 2, GDPR)\n- Risk management (assessment, scoring, treatment)\n- Incident response (NIST SP 800-61r2 lifecycle)\n- Asset and infrastructure security\n\nTry asking:\n- "What is a keylogger and how do we defend against it?"\n- "How is our ISO 27001 compliance doing?"\n- "Explain our incident response procedures"\n- "What are our highest priority risks?"`;
}

export const AiSecurityAdvisor: React.FC<AiSecurityAdvisorProps> = ({
  risks,
  isoControls,
  nistControls,
  assets,
  incidents,
  activeTargetRisk,
  onClearTargetRisk,
  activeTargetControl,
  onClearTargetControl,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "assistant",
      content: `Greetings! I am your virtual Senior Cybersecurity Lead Auditor certified in ISO 27001:2022 and NIST CSF 2.0.

I have analyzed your real-time security posture:
- Open Risk Exposure: ${risks.filter(r => r.status === 'OPEN').length} active threats (${risks.filter(r => r.riskScore >= 16).length} Critical)
- ISO 27001 Readiness: ${Math.round((isoControls.filter(c => c.status === 'FULLY_IMPLEMENTED').length / isoControls.length) * 100)}%
- NIST CSF 2.0 Maturity: ${Math.round((nistControls.filter(c => c.status === 'FULLY_IMPLEMENTED').length / nistControls.length) * 100)}%

How can I assist your security and governance team today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRequestRiskRecommendation = useCallback(async (targetRisk: Risk) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: `Analyze risk profile "${targetRisk.title}" (Likelihood: ${targetRisk.likelihood}, Impact: ${targetRisk.impact}, Score: ${targetRisk.riskScore}/25). Recommend ISO 27001 & NIST CSF mitigation controls.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      const botContent = generateLocalRecommendation(targetRisk, isoControls, nistControls);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: botContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
      if (onClearTargetRisk) onClearTargetRisk();
    }, 600);
  }, [isoControls, nistControls, onClearTargetRisk]);

  const handledRiskRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeTargetRisk && handledRiskRef.current !== activeTargetRisk.id) {
      handledRiskRef.current = activeTargetRisk.id;
      handleRequestRiskRecommendation(activeTargetRisk);
    }
  }, [activeTargetRisk, handleRequestRiskRecommendation]);

  const handleControlGapAnalysis = useCallback(async (control: Control) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: `Analyze compliance gap for control "${control.controlId} - ${control.title}" (${control.framework}). Suggest remediation steps.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    setTimeout(() => {
      const relatedControls = control.framework === "ISO_27001" ? isoControls : nistControls;
      const gapCount = relatedControls.filter(c => c.status !== "FULLY_IMPLEMENTED").length;
      const botContent = `### Gap Analysis for ${control.controlId} (${control.title})\n\n` +
        `**Framework:** ${control.framework} | **Current Status:** ${control.status.replace("_", " ")}\n\n` +
        `**Control Description:**\n${control.description}\n\n` +
        `**Remediation Steps:**\n` +
        `1. Document current implementation state and evidence gaps\n` +
        `2. Assign control owner and set remediation deadline\n` +
        `3. Implement required technical and organizational measures\n` +
        `4. Collect supporting evidence and link to Evidence Vault\n` +
        `5. Schedule verification audit\n\n` +
        `**Related Controls:** ${gapCount} other controls in ${control.framework} also need attention. Consider addressing them in a coordinated remediation sprint.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: botContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
      if (onClearTargetControl) onClearTargetControl();
    }, 600);
  }, [isoControls, nistControls, onClearTargetControl]);

  const handledControlRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeTargetControl && handledControlRef.current !== activeTargetControl.id) {
      handledControlRef.current = activeTargetControl.id;
      handleControlGapAnalysis(activeTargetControl);
    }
  }, [activeTargetControl, handleControlGapAnalysis]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;

    const userMsgText = inputPrompt;
    setInputPrompt("");

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    // Generate locally
    setTimeout(() => {
      const reply = generateLocalChatReply(userMsgText, risks, isoControls, nistControls, assets, incidents);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
    }, 400);
  };

  const presetPrompts = [
    "Generate ISO 27001 Annex A Gap Analysis Plan for our production cloud infra",
    "How to respond to an active Kubernetes pod RCE incident (NIST RS.RP-1)?",
    "Draft Third-Party Vendor Security Risk Assessment questionnaire",
    "Recommend MFA enforcement policy for remote contractors",
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cyber-card p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-violet-600 text-white border border-violet-400/40">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight font-mono text-gradient-violet">
                AI Cyber Security Lead Auditor & SOC Advisor
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-950/80 text-violet-300 border border-violet-500/40 font-mono">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              Context-aware security governance assistant trained on ISO 27001:2022, NIST CSF 2.0, SOC 2 Type II, and real-time threat modeling.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Preset Prompts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presetPrompts.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputPrompt(promptText);
            }}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left text-xs text-slate-300 hover:text-purple-200 transition-all flex items-start gap-2 group"
          >
            <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <span className="line-clamp-2">{promptText}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[60vh] sm:h-[520px] overflow-hidden shadow-2xl">
        
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isBot
                      ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                      : "bg-cyan-600/20 text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isBot
                      ? "bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm"
                      : "bg-cyan-600 text-white shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-xs opacity-70">
                    <span className="font-bold">{isBot ? "AI Auditor" : "You (Security Specialist)"}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                AI is analyzing threat posture and standard controls...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask AI Lead Auditor about ISO 27001, NIST CSF 2.0, threat modeling, or risk scoring..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="px-5 py-3 rounded-xl font-semibold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition-all flex items-center gap-2 text-xs"
          >
            <span>Consult</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
};

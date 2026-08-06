export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RiskStatus = "OPEN" | "UNDER_REVIEW" | "MITIGATED" | "ACCEPTED" | "TRANSFERRED";

export type AssetType = "HARDWARE" | "SOFTWARE" | "CLOUD_INFRA" | "DATA_STORE" | "THIRD_PARTY_VENDOR";

export type Criticality = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ComplianceStatus = "NOT_IMPLEMENTED" | "PARTIALLY_IMPLEMENTED" | "FULLY_IMPLEMENTED" | "NOT_APPLICABLE";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus = "NEW" | "INVESTIGATING" | "CONTAINED" | "ERADICATED" | "CLOSED";

export type FrameworkType = "ISO_27001" | "NIST_CSF_2";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  criticality: Criticality;
  ipAddress?: string;
  owner: string;
  department: string;
  location: string;
  riskCount: number;
  incidentCount: number;
  createdAt: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  likelihood: number; // 1 to 5
  impact: number; // 1 to 5
  riskScore: number; // likelihood * impact (1-25)
  riskLevel: RiskLevel;
  status: RiskStatus;
  category: "Technical" | "Organizational" | "Physical" | "Legal/Compliance" | "Third-Party";
  mitigationPlan: string;
  assetId?: string;
  assetName?: string;
  assignee: string;
  targetFrameworkControls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Control {
  id: string;
  controlId: string; // e.g. "A.5.1" or "PR.AC-1"
  title: string;
  description: string;
  category: string;
  framework: FrameworkType;
  status: ComplianceStatus;
  evidenceIds: string[];
  owner: string;
  notes?: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  linkedControlIds: string[];
  notes?: string;
  url?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assetId?: string;
  assetName?: string;
  reporter: string;
  reportedAt: string;
  resolvedAt?: string;
  rootCause?: string;
  actionItems?: string[];
}

export interface AiRecommendation {
  id: string;
  targetType: "RISK" | "COMPLIANCE" | "INCIDENT";
  targetId: string;
  summary: string;
  riskLevel: RiskLevel;
  suggestedActions: string[];
  recommendedControls: Array<{
    code: string;
    name: string;
    description: string;
  }>;
  mitigationPriority: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type ViewTab = 
  | "dashboard"
  | "risk-matrix"
  | "compliance-iso"
  | "compliance-nist"
  | "assets"
  | "evidence"
  | "incidents"
  | "ai-advisor"
  | "executive-report";

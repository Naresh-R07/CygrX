import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DashboardOverview } from "./components/DashboardOverview";
import { RiskMatrixHeatmap } from "./components/RiskMatrixHeatmap";
import { RiskModal } from "./components/RiskModal";
import { ComplianceTracker } from "./components/ComplianceTracker";
import { AssetInventory } from "./components/AssetInventory";
import { EvidenceVault } from "./components/EvidenceVault";
import { IncidentTracker } from "./components/IncidentTracker";
import { AiSecurityAdvisor } from "./components/AiSecurityAdvisor";
import { ExecutiveReportView } from "./components/ExecutiveReportView";

import { 
  initialAssets, 
  initialRisks, 
  initialIsoControls, 
  initialNistControls, 
  initialEvidences, 
  initialIncidents 
} from "./data/initialGrcData";
import { 
  Asset, 
  Control, 
  Evidence, 
  Incident, 
  Risk, 
  RiskStatus, 
  ComplianceStatus, 
  IncidentStatus, 
  ViewTab 
} from "./types";
import { calculateRiskScore } from "./utils/riskEngine";

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<ViewTab>("dashboard");

  // GRC Core State with LocalStorage fallbacks
  const [risks, setRisks] = useState<Risk[]>(() => {
    const saved = localStorage.getItem("aegis_grc_risks");
    return saved ? JSON.parse(saved) : initialRisks;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem("aegis_grc_assets");
    return saved ? JSON.parse(saved) : initialAssets;
  });

  const [isoControls, setIsoControls] = useState<Control[]>(() => {
    const saved = localStorage.getItem("aegis_grc_iso");
    return saved ? JSON.parse(saved) : initialIsoControls;
  });

  const [nistControls, setNistControls] = useState<Control[]>(() => {
    const saved = localStorage.getItem("aegis_grc_nist");
    return saved ? JSON.parse(saved) : initialNistControls;
  });

  const [evidences, setEvidences] = useState<Evidence[]>(() => {
    const saved = localStorage.getItem("aegis_grc_evidences");
    return saved ? JSON.parse(saved) : initialEvidences;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem("aegis_grc_incidents");
    return saved ? JSON.parse(saved) : initialIncidents;
  });

  // Modal and active selection states
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [activeTargetRisk, setActiveTargetRisk] = useState<Risk | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("aegis_grc_risks", JSON.stringify(risks));
  }, [risks]);

  useEffect(() => {
    localStorage.setItem("aegis_grc_assets", JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem("aegis_grc_iso", JSON.stringify(isoControls));
  }, [isoControls]);

  useEffect(() => {
    localStorage.setItem("aegis_grc_nist", JSON.stringify(nistControls));
  }, [nistControls]);

  useEffect(() => {
    localStorage.setItem("aegis_grc_evidences", JSON.stringify(evidences));
  }, [evidences]);

  useEffect(() => {
    localStorage.setItem("aegis_grc_incidents", JSON.stringify(incidents));
  }, [incidents]);

  // Actions
  const handleSaveRisk = (riskData: Partial<Risk>) => {
    if (riskData.id) {
      // Update existing
      setRisks((prev) =>
        prev.map((r) => (r.id === riskData.id ? ({ ...r, ...riskData } as Risk) : r))
      );
    } else {
      // Create new
      const likelihood = riskData.likelihood || 3;
      const impact = riskData.impact || 3;
      const scoreMeta = calculateRiskScore(likelihood, impact);

      const newRisk: Risk = {
        id: `rsk-${Date.now()}`,
        title: riskData.title || "Untitled Risk",
        description: riskData.description || "",
        likelihood,
        impact,
        riskScore: scoreMeta.score,
        riskLevel: scoreMeta.level,
        status: riskData.status || "OPEN",
        category: riskData.category || "Technical",
        mitigationPlan: riskData.mitigationPlan || "",
        assetId: riskData.assetId,
        assetName: riskData.assetName || "General Infrastructure",
        assignee: riskData.assignee || "Security Ops",
        targetFrameworkControls: ["ISO 27001 A.8.8", "NIST PR.IP-1"],
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setRisks((prev) => [newRisk, ...prev]);
    }

    setEditingRisk(null);
  };

  const handleUpdateRiskStatus = (riskId: string, status: RiskStatus) => {
    setRisks((prev) =>
      prev.map((r) =>
        r.id === riskId
          ? { ...r, status, updatedAt: new Date().toISOString().split("T")[0] }
          : r
      )
    );
  };

  const handleRequestAiAdviceForRisk = (risk: Risk) => {
    setActiveTargetRisk(risk);
    setCurrentTab("ai-advisor");
  };

  const handleUpdateIsoControlStatus = (controlId: string, status: ComplianceStatus) => {
    setIsoControls((prev) =>
      prev.map((c) =>
        c.id === controlId
          ? { ...c, status, updatedAt: new Date().toISOString().split("T")[0] }
          : c
      )
    );
  };

  const handleUpdateNistControlStatus = (controlId: string, status: ComplianceStatus) => {
    setNistControls((prev) =>
      prev.map((c) =>
        c.id === controlId
          ? { ...c, status, updatedAt: new Date().toISOString().split("T")[0] }
          : c
      )
    );
  };

  const handleAddAsset = (assetData: Partial<Asset>) => {
    const newAsset: Asset = {
      id: assetData.id || `ast-${Date.now()}`,
      name: assetData.name || "New Asset",
      type: assetData.type || "CLOUD_INFRA",
      criticality: assetData.criticality || "MEDIUM",
      ipAddress: assetData.ipAddress,
      owner: assetData.owner || "IT Lead",
      department: assetData.department || "Engineering",
      location: assetData.location || "AWS us-east-1",
      riskCount: 0,
      incidentCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  const handleAddEvidence = (evidenceData: Partial<Evidence>) => {
    const newEvidence: Evidence = {
      id: evidenceData.id || `ev-${Date.now()}`,
      title: evidenceData.title || "Audit Artifact",
      fileName: evidenceData.fileName || "document.pdf",
      fileSize: evidenceData.fileSize || "1.0 MB",
      fileType: evidenceData.fileType || "application/pdf",
      uploadedBy: evidenceData.uploadedBy || "Security Auditor",
      uploadedAt: new Date().toISOString().split("T")[0],
      linkedControlIds: evidenceData.linkedControlIds || [],
      notes: evidenceData.notes,
    };
    setEvidences((prev) => [newEvidence, ...prev]);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    setEvidences((prev) => prev.filter((e) => e.id !== evidenceId));
  };

  const handleAddIncident = (incidentData: Partial<Incident>) => {
    const newIncident: Incident = {
      id: incidentData.id || `inc-${Date.now()}`,
      title: incidentData.title || "Security Alert",
      description: incidentData.description || "",
      severity: incidentData.severity || "HIGH",
      status: "NEW",
      assetId: incidentData.assetId,
      assetName: incidentData.assetName || "Global Infrastructure",
      reporter: incidentData.reporter || "SOC Detection",
      reportedAt: new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
      rootCause: incidentData.rootCause,
      actionItems: incidentData.actionItems || ["Investigate logs"],
    };
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const handleUpdateIncidentStatus = (incidentId: string, status: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status } : i))
    );
  };

  const openRisksCount = risks.filter((r) => r.status === "OPEN" || r.status === "UNDER_REVIEW").length;
  const criticalRisksCount = risks.filter((r) => r.riskScore >= 16).length;
  const openIncidentsCount = incidents.filter((i) => i.status !== "CLOSED").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewRiskModal={() => {
          setEditingRisk(null);
          setIsRiskModalOpen(true);
        }}
        openIncidentsCount={openIncidentsCount}
        criticalRisksCount={criticalRisksCount}
      />

      {/* Main Body Layout */}
      <div className="flex flex-1">
        
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openRisksCount={openRisksCount}
          openIncidentsCount={openIncidentsCount}
        />

        {/* Content View Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {currentTab === "dashboard" && (
            <DashboardOverview
              risks={risks}
              assets={assets}
              isoControls={isoControls}
              nistControls={nistControls}
              incidents={incidents}
              onSelectTab={setCurrentTab}
              onSelectRisk={(risk) => {
                setEditingRisk(risk);
                setIsRiskModalOpen(true);
              }}
              onOpenNewRiskModal={() => {
                setEditingRisk(null);
                setIsRiskModalOpen(true);
              }}
            />
          )}

          {currentTab === "risk-matrix" && (
            <RiskMatrixHeatmap
              risks={risks}
              onOpenNewRiskModal={() => {
                setEditingRisk(null);
                setIsRiskModalOpen(true);
              }}
              onSelectRisk={(risk) => {
                setEditingRisk(risk);
                setIsRiskModalOpen(true);
              }}
              onUpdateRiskStatus={handleUpdateRiskStatus}
              onRequestAiAdvice={handleRequestAiAdviceForRisk}
            />
          )}

          {currentTab === "compliance-iso" && (
            <ComplianceTracker
              framework="ISO_27001"
              controls={isoControls}
              evidences={evidences}
              onUpdateControlStatus={handleUpdateIsoControlStatus}
              onRequestAiGapAnalysis={(control) => {
                setCurrentTab("ai-advisor");
              }}
            />
          )}

          {currentTab === "compliance-nist" && (
            <ComplianceTracker
              framework="NIST_CSF_2"
              controls={nistControls}
              evidences={evidences}
              onUpdateControlStatus={handleUpdateNistControlStatus}
              onRequestAiGapAnalysis={(control) => {
                setCurrentTab("ai-advisor");
              }}
            />
          )}

          {currentTab === "assets" && (
            <AssetInventory
              assets={assets}
              onAddAsset={handleAddAsset}
              onDeleteAsset={handleDeleteAsset}
            />
          )}

          {currentTab === "evidence" && (
            <EvidenceVault
              evidences={evidences}
              isoControls={isoControls}
              nistControls={nistControls}
              onAddEvidence={handleAddEvidence}
              onDeleteEvidence={handleDeleteEvidence}
            />
          )}

          {currentTab === "incidents" && (
            <IncidentTracker
              incidents={incidents}
              assets={assets}
              onAddIncident={handleAddIncident}
              onUpdateIncidentStatus={handleUpdateIncidentStatus}
            />
          )}

          {currentTab === "ai-advisor" && (
            <AiSecurityAdvisor
              risks={risks}
              isoControls={isoControls}
              nistControls={nistControls}
              assets={assets}
              incidents={incidents}
              activeTargetRisk={activeTargetRisk}
              onClearTargetRisk={() => setActiveTargetRisk(null)}
            />
          )}

          {currentTab === "executive-report" && (
            <ExecutiveReportView
              risks={risks}
              assets={assets}
              isoControls={isoControls}
              nistControls={nistControls}
              incidents={incidents}
            />
          )}
        </main>

      </div>

      {/* Log/Edit Risk Drawer Modal */}
      <RiskModal
        isOpen={isRiskModalOpen}
        onClose={() => {
          setIsRiskModalOpen(false);
          setEditingRisk(null);
        }}
        onSaveRisk={handleSaveRisk}
        assets={assets}
        editingRisk={editingRisk}
      />

    </div>
  );
}

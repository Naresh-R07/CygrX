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
import { OpenSourceIntegrations } from "./components/OpenSourceIntegrations";

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

// Helper for Realtime Viewport & Tab Aspect Ratio Detection
function getViewportDetails() {
  const width = typeof window !== "undefined" ? window.innerWidth : 1280;
  const height = typeof window !== "undefined" ? window.innerHeight : 800;
  
  const isMobile = width < 1024;
  let deviceType = "PC";
  if (width < 640) deviceType = "Mobile";
  else if (width < 1024) deviceType = "Tablet";
  else if (width >= 1920) deviceType = "UltraWide";

  // Calculate mathematical aspect ratio
  const ratio = width / height;
  let aspectRatio = "16:9";
  if (ratio < 0.7) aspectRatio = "9:16 (Tall)";
  else if (ratio < 1.1) aspectRatio = "4:3 (Square)";
  else if (ratio < 1.5) aspectRatio = "16:10";
  else if (ratio < 2.0) aspectRatio = "16:9";
  else aspectRatio = "21:9 (UltraWide)";

  return { width, height, isMobile, deviceType, aspectRatio };
}

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<ViewTab>("dashboard");

  // Realtime Device Ratio & Screen Width Detection State
  const [viewport, setViewport] = useState(getViewportDetails);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !getViewportDetails().isMobile);

  // Monitor Window & Container Resize Events seamlessly so changing tab ratio never breaks layouts
  useEffect(() => {
    const handleResize = () => {
      const details = getViewportDetails();
      setViewport(details);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      const calcResult = calculateRiskScore(likelihood, impact);

      const newRisk: Risk = {
        id: `risk-${Date.now()}`,
        title: riskData.title || "Untitled Risk",
        description: riskData.description || "",
        category: riskData.category || "Technical",
        assetId: riskData.assetId || "",
        assetName: riskData.assetName || "Global Asset",
        likelihood,
        impact,
        riskScore: calcResult.score,
        riskLevel: calcResult.level,
        status: (riskData.status as RiskStatus) || "OPEN",
        targetFrameworkControls: riskData.targetFrameworkControls || [],
        mitigationPlan: riskData.mitigationPlan || "",
        assignee: riskData.assignee || "SecOps Team",
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      setRisks((prev) => [newRisk, ...prev]);
    }

    setIsRiskModalOpen(false);
    setEditingRisk(null);
  };

  const handleUpdateRiskStatus = (riskId: string, status: RiskStatus) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === riskId ? { ...r, status, updatedAt: new Date().toISOString().split("T")[0] } : r))
    );
  };

  const handleRequestAiAdviceForRisk = (risk: Risk) => {
    setActiveTargetRisk(risk);
    setCurrentTab("ai-advisor");
  };

  const handleUpdateIsoControlStatus = (controlId: string, status: ComplianceStatus) => {
    setIsoControls((prev) =>
      prev.map((c) => (c.id === controlId ? { ...c, status } : c))
    );
  };

  const handleUpdateNistControlStatus = (controlId: string, status: ComplianceStatus) => {
    setNistControls((prev) =>
      prev.map((c) => (c.id === controlId ? { ...c, status } : c))
    );
  };

  const handleAddAsset = (assetData: Partial<Asset>) => {
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: assetData.name || "New Asset",
      type: assetData.type || "CLOUD_INFRA",
      criticality: assetData.criticality || "MEDIUM",
      owner: assetData.owner || "IT Ops",
      department: assetData.department || "Engineering",
      location: assetData.location || "US-East (Cloud)",
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
      id: `ev-${Date.now()}`,
      title: evidenceData.title || "Uploaded Evidence",
      fileName: evidenceData.fileName || "evidence_doc.pdf",
      fileType: evidenceData.fileType || "PDF",
      fileSize: evidenceData.fileSize || "1.2 MB",
      uploadedBy: evidenceData.uploadedBy || "Security Lead",
      uploadedAt: new Date().toISOString().split("T")[0],
      linkedControlIds: evidenceData.linkedControlIds || [],
    };
    setEvidences((prev) => [newEvidence, ...prev]);
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    setEvidences((prev) => prev.filter((e) => e.id !== evidenceId));
  };

  const handleAddIncident = (incidentData: Partial<Incident>) => {
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: incidentData.title || "Security Alert",
      severity: incidentData.severity || "HIGH",
      status: "NEW",
      description: incidentData.description || "",
      reporter: incidentData.reporter || "SOC Auto-Detector",
      reportedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      assetId: incidentData.assetId || "",
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-violet-500 selection:text-white">
      
      {/* Top Header with Navbar Toggle & Device Ratio Detector */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewRiskModal={() => {
          setEditingRisk(null);
          setIsRiskModalOpen(true);
        }}
        openIncidentsCount={openIncidentsCount}
        criticalRisksCount={criticalRisksCount}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        deviceType={viewport.deviceType}
        aspectRatio={viewport.aspectRatio}
        isMobile={viewport.isMobile}
      />

      {/* Main Body Layout with Collapsible/Mobile Drawer Sidebar */}
      <div className="flex flex-1 relative overflow-x-hidden">
        
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openRisksCount={openRisksCount}
          openIncidentsCount={openIncidentsCount}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={viewport.isMobile}
          deviceType={viewport.deviceType}
          aspectRatio={viewport.aspectRatio}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden min-w-0 transition-all">
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
              onRequestAiGapAnalysis={() => {
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
              onRequestAiGapAnalysis={() => {
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

          {currentTab === "integrations" && (
            <OpenSourceIntegrations />
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

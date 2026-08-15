import React, { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
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
import { api } from "./api/client";
import { useWebSocket } from "./hooks/useWebSocket";
import { Asset, Control, Evidence, Incident, Risk, RiskStatus, ComplianceStatus, IncidentStatus, ViewTab } from "./types";

function getViewportDetails() {
  const width = typeof window !== "undefined" ? window.innerWidth : 1280;
  const isMobile = width < 1024;
  return { width, isMobile };
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<ViewTab>("dashboard");
  const [viewport, setViewport] = useState(getViewportDetails);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !getViewportDetails().isMobile);

  const [risks, setRisks] = useState<Risk[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isoControls, setIsoControls] = useState<Control[]>([]);
  const [nistControls, setNistControls] = useState<Control[]>([]);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [activeTargetRisk, setActiveTargetRisk] = useState<Risk | null>(null);

  useEffect(() => {
    const handleResize = () => setViewport(getViewportDetails());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [risksRes, assetsRes, isoRes, nistRes, evidenceRes, incidentsRes] = await Promise.all([
        api.risks.list(),
        api.assets.list(),
        api.controls.list("ISO_27001"),
        api.controls.list("NIST_CSF_2"),
        api.evidence.list(),
        api.incidents.list(),
      ]);
      setRisks(risksRes.risks);
      setAssets(assetsRes.assets);
      setIsoControls(isoRes.controls);
      setNistControls(nistRes.controls);
      setEvidences(evidenceRes.evidences);
      setIncidents(incidentsRes.incidents);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useWebSocket((event) => {
    if (event.entity === "risk") loadData();
    if (event.entity === "incident") loadData();
    if (event.entity === "asset") loadData();
    if (event.entity === "control") loadData();
    if (event.entity === "evidence") loadData();
  });

  const handleSaveRisk = async (riskData: Partial<Risk>) => {
    try {
      if (riskData.id) {
        await api.risks.update(riskData.id, riskData);
      } else {
        await api.risks.create(riskData);
      }
      await loadData();
      setIsRiskModalOpen(false);
      setEditingRisk(null);
    } catch (err) {
      console.error("Failed to save risk:", err);
    }
  };

  const handleUpdateRiskStatus = async (riskId: string, status: RiskStatus) => {
    try {
      await api.risks.update(riskId, { status });
      await loadData();
    } catch (err) {
      console.error("Failed to update risk:", err);
    }
  };

  const handleRequestAiAdviceForRisk = (risk: Risk) => {
    setActiveTargetRisk(risk);
    setCurrentTab("ai-advisor");
  };

  const handleUpdateIsoControlStatus = async (controlId: string, status: ComplianceStatus) => {
    try {
      await api.controls.update(controlId, { status });
      await loadData();
    } catch (err) {
      console.error("Failed to update control:", err);
    }
  };

  const handleUpdateNistControlStatus = async (controlId: string, status: ComplianceStatus) => {
    try {
      await api.controls.update(controlId, { status });
      await loadData();
    } catch (err) {
      console.error("Failed to update control:", err);
    }
  };

  const handleAddAsset = async (assetData: Partial<Asset>) => {
    try {
      await api.assets.create(assetData);
      await loadData();
    } catch (err) {
      console.error("Failed to add asset:", err);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await api.assets.delete(assetId);
      await loadData();
    } catch (err) {
      console.error("Failed to delete asset:", err);
    }
  };

  const handleAddEvidence = async (evidenceData: Partial<Evidence>) => {
    try {
      const formData = new FormData();
      if (evidenceData.title) formData.append("title", evidenceData.title);
      if (evidenceData.uploadedBy) formData.append("uploadedBy", evidenceData.uploadedBy);
      if (evidenceData.linkedControlIds) formData.append("linkedControlIds", JSON.stringify(evidenceData.linkedControlIds));
      if (evidenceData.notes) formData.append("notes", evidenceData.notes);
      await api.evidence.upload(formData);
      await loadData();
    } catch (err) {
      console.error("Failed to add evidence:", err);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    try {
      await api.evidence.delete(evidenceId);
      await loadData();
    } catch (err) {
      console.error("Failed to delete evidence:", err);
    }
  };

  const handleAddIncident = async (incidentData: Partial<Incident>) => {
    try {
      await api.incidents.create(incidentData);
      await loadData();
    } catch (err) {
      console.error("Failed to add incident:", err);
    }
  };

  const handleUpdateIncidentStatus = async (incidentId: string, status: IncidentStatus) => {
    try {
      await api.incidents.update(incidentId, { status });
      await loadData();
    } catch (err) {
      console.error("Failed to update incident:", err);
    }
  };

  const openRisksCount = risks.filter((r) => r.status === "OPEN" || r.status === "UNDER_REVIEW").length;
  const criticalRisksCount = risks.filter((r) => r.riskScore >= 16).length;
  const openIncidentsCount = incidents.filter((i) => i.status !== "CLOSED").length;

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-mono">Loading CygrX SOC...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-violet-500 selection:text-white">
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewRiskModal={() => { setEditingRisk(null); setIsRiskModalOpen(true); }}
        openIncidentsCount={openIncidentsCount}
        criticalRisksCount={criticalRisksCount}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isMobile={viewport.isMobile}
      />

      <div className="flex flex-1 relative overflow-x-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openRisksCount={openRisksCount}
          openIncidentsCount={openIncidentsCount}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={viewport.isMobile}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden min-w-0 transition-all">
          {currentTab === "dashboard" && (
            <DashboardOverview risks={risks} assets={assets} isoControls={isoControls} nistControls={nistControls} incidents={incidents} onSelectTab={setCurrentTab} onSelectRisk={(risk) => { setEditingRisk(risk); setIsRiskModalOpen(true); }} onOpenNewRiskModal={() => { setEditingRisk(null); setIsRiskModalOpen(true); }} />
          )}
          {currentTab === "risk-matrix" && (
            <RiskMatrixHeatmap risks={risks} onOpenNewRiskModal={() => { setEditingRisk(null); setIsRiskModalOpen(true); }} onSelectRisk={(risk) => { setEditingRisk(risk); setIsRiskModalOpen(true); }} onUpdateRiskStatus={handleUpdateRiskStatus} onRequestAiAdvice={handleRequestAiAdviceForRisk} />
          )}
          {currentTab === "compliance-iso" && (
            <ComplianceTracker framework="ISO_27001" controls={isoControls} evidences={evidences} onUpdateControlStatus={handleUpdateIsoControlStatus} onRequestAiGapAnalysis={() => setCurrentTab("ai-advisor")} />
          )}
          {currentTab === "compliance-nist" && (
            <ComplianceTracker framework="NIST_CSF_2" controls={nistControls} evidences={evidences} onUpdateControlStatus={handleUpdateNistControlStatus} onRequestAiGapAnalysis={() => setCurrentTab("ai-advisor")} />
          )}
          {currentTab === "assets" && (
            <AssetInventory assets={assets} onAddAsset={handleAddAsset} onDeleteAsset={handleDeleteAsset} />
          )}
          {currentTab === "evidence" && (
            <EvidenceVault evidences={evidences} isoControls={isoControls} nistControls={nistControls} onAddEvidence={handleAddEvidence} onDeleteEvidence={handleDeleteEvidence} />
          )}
          {currentTab === "incidents" && (
            <IncidentTracker incidents={incidents} assets={assets} onAddIncident={handleAddIncident} onUpdateIncidentStatus={handleUpdateIncidentStatus} />
          )}
          {currentTab === "ai-advisor" && (
            <AiSecurityAdvisor risks={risks} isoControls={isoControls} nistControls={nistControls} assets={assets} incidents={incidents} activeTargetRisk={activeTargetRisk} onClearTargetRisk={() => setActiveTargetRisk(null)} />
          )}
        </main>
      </div>

      <RiskModal isOpen={isRiskModalOpen} onClose={() => { setIsRiskModalOpen(false); setEditingRisk(null); }} onSaveRisk={handleSaveRisk} assets={assets} editingRisk={editingRisk} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

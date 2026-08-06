import React from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Server, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  FileCheck2,
  AlertOctagon,
  ArrowRight
} from "lucide-react";
import { Asset, Control, Incident, Risk, ViewTab } from "../types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

interface DashboardOverviewProps {
  risks: Risk[];
  assets: Asset[];
  isoControls: Control[];
  nistControls: Control[];
  incidents: Incident[];
  onSelectTab: (tab: ViewTab) => void;
  onSelectRisk: (risk: Risk) => void;
  onOpenNewRiskModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  risks,
  assets,
  isoControls,
  nistControls,
  incidents,
  onSelectTab,
  onSelectRisk,
  onOpenNewRiskModal,
}) => {
  // Metrics calculation
  const totalRisks = risks.length;
  const criticalRisks = risks.filter((r) => r.riskScore >= 16);
  const highRisks = risks.filter((r) => r.riskScore >= 10 && r.riskScore < 16);
  const openRisks = risks.filter((r) => r.status === "OPEN" || r.status === "UNDER_REVIEW");

  const isoImplemented = isoControls.filter((c) => c.status === "FULLY_IMPLEMENTED").length;
  const isoScore = Math.round((isoImplemented / isoControls.length) * 100) || 0;

  const nistImplemented = nistControls.filter((c) => c.status === "FULLY_IMPLEMENTED").length;
  const nistScore = Math.round((nistImplemented / nistControls.length) * 100) || 0;

  const openIncidents = incidents.filter((i) => i.status !== "CLOSED");

  // Chart data
  const riskLevelDistribution = [
    { name: "Critical (16-25)", value: criticalRisks.length, color: "#ef4444" },
    { name: "High (10-15)", value: highRisks.length, color: "#f97316" },
    { name: "Medium (5-9)", value: risks.filter((r) => r.riskScore >= 5 && r.riskScore < 10).length, color: "#f59e0b" },
    { name: "Low (1-4)", value: risks.filter((r) => r.riskScore < 5).length, color: "#10b981" },
  ];

  const complianceComparison = [
    { name: "ISO 27001", implemented: isoImplemented, total: isoControls.length, percentage: isoScore },
    { name: "NIST CSF 2.0", implemented: nistImplemented, total: nistControls.length, percentage: nistScore },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Bento Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">BENTO DASHBOARD MATRIX</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              REALTIME GOVERNANCE
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-mono">Cyber Security Governance & Executive Monitor</h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Real-time cyber risk exposure, ISO 27001 & NIST CSF compliance readiness, asset vulnerabilities, and AI threat recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onSelectTab("ai-advisor")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            AI Threat Advisor
          </button>
          <button
            onClick={onOpenNewRiskModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 shadow-md transition-all border border-slate-700"
          >
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            Log Security Risk
          </button>
        </div>
      </div>

      {/* Main Bento Grid Container */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        
        {/* Bento Card 1: Large Risk Exposure & Live Telemetry Feature Block (Col 8) */}
        <div 
          onClick={() => onSelectTab("risk-matrix")}
          className="col-span-12 lg:col-span-8 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">OPEN RISK EXPOSURE</span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE HEATMAP
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold text-white font-mono tracking-tighter">{openRisks.length}</span>
                  <span className="text-sm text-slate-400 font-mono">/ {totalRisks} total identified risks</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  <span className="text-rose-400 font-bold">{criticalRisks.length} Critical Risks</span> requiring immediate remediation plan.
                </p>
              </div>

              {/* Sparkline Visual Simulation */}
              <div className="flex items-end gap-1.5 h-12 pt-2">
                <div className="w-3 bg-slate-800 rounded-t h-[40%]" />
                <div className="w-3 bg-slate-800 rounded-t h-[65%]" />
                <div className="w-3 bg-indigo-500 rounded-t h-[85%]" />
                <div className="w-3 bg-indigo-400 rounded-t h-[50%]" />
                <div className="w-3 bg-indigo-600 rounded-t h-[100%]" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Highest Threat: Ransomware & Kubernetes Misconfig
            </span>
            <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Open 5x5 Matrix <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Bento Card 2: Featured Indigo Card - System Compliance Maturity (Col 4) */}
        <div 
          onClick={() => onSelectTab("compliance-iso")}
          className="col-span-12 lg:col-span-4 bg-indigo-600 text-white p-6 rounded-2xl cursor-pointer shadow-xl shadow-indigo-600/10 flex flex-col justify-between group relative overflow-hidden border border-indigo-500/40"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest font-mono">COMPLIANCE UPTIME</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white font-mono">
                ISO & NIST
              </span>
            </div>

            <div className="mt-2">
              <span className="text-5xl font-extrabold text-white font-mono tracking-tighter">{isoScore}%</span>
              <p className="text-xs text-indigo-100 mt-2 font-medium">
                {isoImplemented} of {isoControls.length} ISO 27001:2022 Annex A controls verified & compliant.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-500/40 flex items-center justify-between text-xs font-mono">
            <span className="text-indigo-100 font-medium">Auditor Readiness</span>
            <span className="text-white font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Audit Vault <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Bento Card 3: NIST CSF Maturity (Col 4) */}
        <div 
          onClick={() => onSelectTab("compliance-nist")}
          className="col-span-12 sm:col-span-6 lg:col-span-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">NIST CSF 2.0 MATURITY</span>
            <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{nistScore}%</span>
            <span className="text-xs text-slate-400 font-mono">({nistImplemented}/{nistControls.length})</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Implementation across Identify, Protect, Detect, Respond, Recover.</p>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-indigo-400">
            <span>Tier 3 (Repeatable)</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Bento Card 4: Incident Command Status (Col 4) */}
        <div 
          onClick={() => onSelectTab("incidents")}
          className="col-span-12 sm:col-span-6 lg:col-span-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">ACTIVE INCIDENTS</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">{openIncidents.length}</span>
            <span className="text-xs text-slate-400 font-mono">Active Response</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Across {assets.length} monitored enterprise infrastructure assets.</p>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-rose-400">
            <span>Command Center</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Bento Card 5: AI Lead Security Advisor Ticker (Col 4) */}
        <div 
          onClick={() => onSelectTab("ai-advisor")}
          className="col-span-12 lg:col-span-4 bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 p-5 rounded-2xl cursor-pointer transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                GEMINI AI ADVISOR
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                RECOMMENDATION
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "Priority recommendation: 2 Critical open risks directly affect Production Kubernetes (EKS) and Okta Identity. Remediating CVE-2026-1940 boosts ISO 27001 score by +12%."
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-indigo-400 pt-2 border-t border-slate-800">
            <span>Consult Gemini Engine</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Bento Row 2: Priority Security Risks Table & Charts (Col 8 & Col 4) */}

        {/* Priority Risks Table Block (Col 8) */}
        <div className="col-span-12 lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">SECURITY EXPOSURE LOG</span>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Priority Security Risks Requiring Mitigation
              </h2>
            </div>
            <button
              onClick={() => onSelectTab("risk-matrix")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-semibold flex items-center gap-1"
            >
              Matrix Grid <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {risks.slice(0, 4).map((risk) => {
              const isCritical = risk.riskScore >= 16;
              const isHigh = risk.riskScore >= 10 && risk.riskScore < 16;
              return (
                <div
                  key={risk.id}
                  onClick={() => onSelectRisk(risk)}
                  className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        isCritical
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : isHigh
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                      }`}>
                        Score {risk.riskScore}/25 ({risk.riskLevel})
                      </span>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {risk.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{risk.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                      <span>Asset: <strong className="text-slate-300">{risk.assetName || "Global"}</strong></span>
                      <span>Owner: <strong className="text-slate-300">{risk.assignee}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRisk(risk);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 transition-all"
                    >
                      Inspect Risk
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Level Distribution Chart (Col 4) */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">DISTRIBUTION</span>
            <h2 className="text-base font-bold text-white font-mono mt-0.5 mb-1">Risk Severity Breakdown</h2>
            <p className="text-xs text-slate-400 mb-4">Categorized by 5x5 Likelihood x Impact rating</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskLevelDistribution}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskLevelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
            {riskLevelDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.name}</span>
                <span className="ml-auto font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

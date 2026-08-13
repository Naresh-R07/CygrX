import React from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Sparkles, 
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
    { name: "Critical (16-25)", value: criticalRisks.length, color: "#f43f5e" },
    { name: "High (10-15)", value: highRisks.length, color: "#fb923c" },
    { name: "Medium (5-9)", value: risks.filter((r) => r.riskScore >= 5 && r.riskScore < 10).length, color: "#8b5cf6" },
    { name: "Low (1-4)", value: risks.filter((r) => r.riskScore < 5).length, color: "#06b6d4" },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Behance Cyber Command Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 cyber-card p-6 rounded-3xl relative overflow-hidden radar-sweep border border-violet-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping shadow-[0_0_10px_rgba(139,92,246,0.9)]" />
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">CYGRX ENTERPRISE DEFENSE OS</span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-violet-950/90 text-violet-300 border border-violet-500/40 font-mono uppercase shadow-[0_0_12px_rgba(139,92,246,0.25)]">
              LIVE SOC TELEMETRY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono text-gradient-violet">
            Enterprise Cybersecurity Threat & GRC Operations Command
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1.5 font-mono leading-relaxed">
            Continuous threat vector defense, real-time 5x5 matrix risk exposure, ISO 27001 & NIST CSF 2.0 readiness, and Gemini AI SOC intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => onSelectTab("ai-advisor")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all border border-violet-400/50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-violet-200 animate-spin" style={{ animationDuration: '6s' }} />
            AI SOC Advisor
          </button>
          <button
            onClick={onOpenNewRiskModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-mono bg-slate-900/90 hover:bg-slate-800 text-violet-300 shadow-md transition-all border border-violet-800/60 hover:border-violet-500/50 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-violet-400" />
            Log Threat Risk
          </button>
        </div>
      </div>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        
        {/* Bento Card 1: Large Threat Exposure & Live Telemetry Feature Block (Col 8) */}
        <div 
          onClick={() => onSelectTab("risk-matrix")}
          className="col-span-12 lg:col-span-8 cyber-card hover:border-violet-400/60 p-6 rounded-3xl cursor-pointer transition-all group flex flex-col justify-between relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                ACTIVE THREAT VECTOR TELEMETRY
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                RADAR STREAMING
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">{openRisks.length}</span>
                  <span className="text-sm text-slate-400 font-mono">/ {totalRisks} total identified threat vectors</span>
                </div>
                <p className="text-xs text-slate-300 mt-2 font-mono flex items-center gap-2">
                  <span className="text-rose-400 font-bold bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                    {criticalRisks.length} CRITICAL EXPOSURES
                  </span> 
                  <span>Requires immediate remediation plan</span>
                </p>
              </div>

              {/* Glowing Sparkline Graphic */}
              <div className="flex items-end gap-1.5 h-14 pt-2">
                <div className="w-3 bg-slate-800 rounded-t h-[35%]" />
                <div className="w-3 bg-slate-800 rounded-t h-[55%]" />
                <div className="w-3 bg-violet-600 rounded-t h-[85%] shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
                <div className="w-3 bg-cyan-400 rounded-t h-[60%] shadow-[0_0_10px_rgba(6,182,212,0.7)]" />
                <div className="w-3 bg-indigo-500 rounded-t h-[100%] shadow-[0_0_15px_rgba(99,102,241,0.9)]" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/90 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
              Target Focus: Ransomware, K8s Exploits, Identity Spoofing
            </span>
            <span className="text-violet-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Open 5x5 Heatmap <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Bento Card 2: Featured Compliance Maturity Gauge (Col 4) */}
        <div 
          onClick={() => onSelectTab("compliance-iso")}
          className="col-span-12 lg:col-span-4 bg-gradient-to-br from-violet-950 via-slate-900 to-cyan-950 text-white p-6 rounded-3xl cursor-pointer shadow-[0_0_30px_rgba(139,92,246,0.25)] flex flex-col justify-between group relative overflow-hidden border border-violet-500/50"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32 text-violet-400" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest font-mono">AUDIT READINESS SCORE</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-200 font-mono border border-violet-400/40">
                ISO & NIST
              </span>
            </div>

            <div className="mt-2">
              <span className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">{isoScore}%</span>
              <p className="text-xs text-slate-200 mt-2 font-mono leading-relaxed">
                {isoImplemented} of {isoControls.length} ISO 27001:2022 Annex A controls verified & compliant.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-violet-500/30 flex items-center justify-between text-xs font-mono">
            <span className="text-violet-200 font-medium">Auditor Evidence Vault</span>
            <span className="text-violet-300 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              Vault <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Bento Card 3: NIST CSF 2.0 Framework (Col 4) */}
        <div 
          onClick={() => onSelectTab("compliance-nist")}
          className="col-span-12 sm:col-span-6 lg:col-span-4 cyber-card p-5 rounded-3xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">NIST CSF 2.0 MATURITY</span>
            <div className="p-2 rounded-xl bg-violet-950/80 text-violet-400 border border-violet-800/60">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{nistScore}%</span>
            <span className="text-xs text-slate-400 font-mono">({nistImplemented}/{nistControls.length})</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 font-medium">Identify, Protect, Detect, Respond, Recover functions active.</p>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-violet-400">
            <span>Tier 3 (Repeatable)</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Bento Card 4: Incident Command Center (Col 4) */}
        <div 
          onClick={() => onSelectTab("incidents")}
          className="col-span-12 sm:col-span-6 lg:col-span-4 cyber-card p-5 rounded-3xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ACTIVE INCIDENTS</span>
            <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">{openIncidents.length}</span>
            <span className="text-xs text-slate-400 font-mono">SOC Active Response</span>
          </div>
          <p className="text-xs text-slate-300 mt-2 font-medium">Monitoring {assets.length} cloud & enterprise assets.</p>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-rose-400">
            <span>Incident Command</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Bento Card 5: AI SOC Threat Advisor Intelligence (Col 4) */}
        <div 
          onClick={() => onSelectTab("ai-advisor")}
          className="col-span-12 lg:col-span-4 cyber-card border border-violet-500/40 p-5 rounded-3xl cursor-pointer transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                GEMINI AI SOC ADVISOR
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-violet-950/90 text-violet-300 border border-violet-500/30">
                RECOMMENDATION
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              "Priority: Remediate Kubernetes (EKS) CVE-2026-1940 and enforce MFA on Okta identity. This will elevate total ISO 27001 readiness score by +12%."
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-mono text-violet-400 pt-2 border-t border-slate-800/80">
            <span>Consult AI SOC Engine</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Row 2: Security Threat Vector Log & Severity Breakdown */}

        {/* Priority Threat Log (Col 8) */}
        <div className="col-span-12 lg:col-span-8 cyber-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SECURITY EXPOSURE LOG</span>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Priority Security Risks & Threat Remediation
              </h2>
            </div>
            <button
              onClick={() => onSelectTab("risk-matrix")}
              className="text-xs text-violet-400 hover:text-violet-300 font-mono font-semibold flex items-center gap-1 cursor-pointer"
            >
              Matrix View <ArrowRight className="w-3.5 h-3.5" />
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
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-violet-500/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                        isCritical
                          ? "bg-rose-950/90 border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                          : isHigh
                          ? "bg-amber-950/90 border-amber-500/40 text-amber-300"
                          : "bg-violet-950/90 border-violet-500/40 text-violet-300"
                      }`}>
                        Score {risk.riskScore}/25 ({risk.riskLevel})
                      </span>
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
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
                      className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-violet-300 border border-slate-700/80 transition-all cursor-pointer"
                    >
                      Inspect Threat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution Donut Chart (Col 4) */}
        <div className="col-span-12 lg:col-span-4 cyber-card rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">DISTRIBUTION MATRIX</span>
            <h2 className="text-base font-bold text-white font-mono mt-0.5 mb-1">Risk Severity Breakdown</h2>
            <p className="text-xs text-slate-400 mb-4">Categorized by Likelihood × Impact rating</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskLevelDistribution}
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskLevelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0a0e1a", borderColor: "#334155", borderRadius: "12px", color: "#ffffff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
            {riskLevelDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.color }} />
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

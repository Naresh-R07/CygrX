import React from "react";
import { 
  LayoutDashboard, 
  Grid3X3, 
  CheckSquare, 
  ShieldCheck, 
  Server, 
  FolderLock, 
  AlertOctagon, 
  Sparkles, 
  FileSpreadsheet,
  ChevronRight
} from "lucide-react";
import { ViewTab } from "../types";

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  openRisksCount: number;
  openIncidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openRisksCount,
  openIncidentsCount,
}) => {
  const navItems = [
    {
      id: "dashboard" as ViewTab,
      label: "Dashboard & Metrics",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "risk-matrix" as ViewTab,
      label: "5x5 Risk Matrix & Heatmap",
      icon: Grid3X3,
      badge: openRisksCount > 0 ? `${openRisksCount} Open` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "compliance-iso" as ViewTab,
      label: "ISO 27001:2022 Tracker",
      icon: ShieldCheck,
      badge: "82%",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "compliance-nist" as ViewTab,
      label: "NIST CSF 2.0 Tracker",
      icon: CheckSquare,
      badge: "78%",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      id: "assets" as ViewTab,
      label: "Asset Inventory Vault",
      icon: Server,
      badge: null,
    },
    {
      id: "evidence" as ViewTab,
      label: "Audit Evidence Vault",
      icon: FolderLock,
      badge: null,
    },
    {
      id: "incidents" as ViewTab,
      label: "Incident Command",
      icon: AlertOctagon,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount}` : null,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    {
      id: "ai-advisor" as ViewTab,
      label: "AI GRC Security Advisor",
      icon: Sparkles,
      badge: "Gemini 3.6",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "executive-report" as ViewTab,
      label: "Executive Audit Briefing",
      icon: FileSpreadsheet,
      badge: "PDF",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono px-3 mb-3">
          GRC OS MODULES
        </p>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group font-mono ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 font-bold border border-indigo-500/30 shadow-sm shadow-indigo-950/40"
                    : "hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`px-2 py-0.5 rounded text-[10px] border font-bold font-mono ${item.badgeColor || "bg-slate-900 text-slate-300 border-slate-700"}`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "text-indigo-400 rotate-90" : "text-slate-600 opacity-0 group-hover:opacity-100"}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bento Health Module */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">SYSTEM MATURITY</span>
            <span className="text-indigo-400 font-bold font-mono">80% ON TRACK</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: "80%" }} />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-2.5">
            ISO 27001 RE-AUDIT IN 42 DAYS
          </p>
        </div>
      </div>

      {/* Monospace Telemetry Footer */}
      <div className="p-4 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>TERM_ID: 0x992F</span>
        <span className="flex items-center gap-1.5 text-indigo-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          SYSTEM OK
        </span>
      </div>
    </aside>
  );
};

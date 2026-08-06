import React from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  FileText, 
  Search, 
  Bell, 
  Building2
} from "lucide-react";
import { ViewTab } from "../types";

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewRiskModal: () => void;
  openIncidentsCount: number;
  criticalRisksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewRiskModal,
  openIncidentsCount,
  criticalRisksCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left branding - Bento OS style */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSelectTab("dashboard")}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-indigo-600/25 border border-indigo-400/30 group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">CGRX.OS</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-mono">
                  GRC v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest hidden sm:block">Unified Cyber Security Engine</p>
            </div>
          </div>

          {/* Center search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search risks, assets, ISO controls, NIST CSF..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Right action group */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live System Sync Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-slate-400 uppercase tracking-widest">LIVE SYNC ACTIVE</span>
            </div>

            {/* Org Switcher */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-[11px]">ACME CORP</span>
            </div>

            {/* Incidents Indicator */}
            <button
              onClick={() => onSelectTab("incidents")}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title="Active Security Incidents"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {openIncidentsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm font-mono">
                  {openIncidentsCount}
                </span>
              )}
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={() => onSelectTab("ai-advisor")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono tracking-tight transition-all border ${
                currentTab === "ai-advisor"
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900 hover:bg-slate-800 text-indigo-300 border-indigo-500/30 hover:border-indigo-500/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">AI ADVISOR</span>
            </button>

            {/* New Risk Modal Launcher */}
            <button
              onClick={onOpenNewRiskModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50 border border-indigo-400/30 transition-all font-mono"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LOG RISK</span>
            </button>

            {/* Export Briefing Button */}
            <button
              onClick={() => onSelectTab("executive-report")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all font-mono"
              title="View Executive Audit PDF Report"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">BRIEFING</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};

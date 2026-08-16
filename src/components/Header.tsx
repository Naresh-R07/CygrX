import React from "react";
import { 
  Sparkles, 
  PlusCircle, 
  Search, 
  Bell, 
  Menu,
  PanelLeftClose,
  Shield
} from "lucide-react";
import { ViewTab } from "../types";

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewRiskModal: () => void;
  openIncidentsCount: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isMobile: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewRiskModal,
  openIncidentsCount,
  isSidebarOpen,
  onToggleSidebar,
  isMobile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-xl border-b border-violet-900/30 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left branding & Navbar toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-violet-300 hover:text-violet-200 border border-violet-500/30 hover:border-violet-500/60 transition-all cursor-pointer flex items-center justify-center shrink-0"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-violet-400" />
              ) : (
                <Menu className="w-4 h-4 text-violet-400" />
              )}
            </button>

            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSelectTab("dashboard")}>
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-950 via-slate-900 to-cyan-950 rounded-xl flex items-center justify-center text-violet-400 font-extrabold text-lg border border-violet-500/40 group-hover:border-violet-400 transition-all overflow-hidden shrink-0">
                <Shield className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-extrabold text-lg tracking-tight font-mono text-gradient-violet">
                CygrX
              </span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                placeholder="Search threats, controls..."
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/50 shadow-inner transition-all"
              />
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectTab("incidents")}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer group shrink-0"
              aria-label="Active security incidents"
            >
              <Bell className="w-4 h-4 text-slate-300 group-hover:text-violet-300 transition-colors" />
              {openIncidentsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white font-mono animate-pulse">
                  {openIncidentsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab("ai-advisor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold font-mono tracking-tight transition-all border cursor-pointer shrink-0 ${
                currentTab === "ai-advisor"
                  ? "bg-violet-600 text-white border-violet-400"
                  : "bg-slate-900/80 hover:bg-slate-800 text-violet-300 border-violet-500/30 hover:border-violet-500/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span className="hidden md:inline">AI ADVISOR</span>
            </button>

            <button
              onClick={onOpenNewRiskModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all font-mono cursor-pointer shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden md:inline">LOG THREAT</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

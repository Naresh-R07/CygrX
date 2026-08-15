import React from "react";
import { 
  LayoutDashboard, 
  Grid3X3, 
  ShieldCheck, 
  CheckSquare, 
  Server, 
  FolderLock, 
  AlertOctagon, 
  Sparkles, 
  ChevronRight,
  Shield,
  Activity,
  X,
  ChevronLeft,
  Smartphone
} from "lucide-react";
import { ViewTab } from "../types";

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  openRisksCount: number;
  openIncidentsCount: number;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openRisksCount,
  openIncidentsCount,
  isOpen,
  onClose,
  isMobile,
}) => {
  const navItems = [
    {
      id: "dashboard" as ViewTab,
      label: "Dashboard & Metrics",
      icon: LayoutDashboard,
    },
    {
      id: "risk-matrix" as ViewTab,
      label: "Risk Matrix & Heatmap",
      icon: Grid3X3,
      badge: openRisksCount > 0 ? openRisksCount : undefined,
    },
    {
      id: "compliance-iso" as ViewTab,
      label: "ISO 27001 Controls",
      icon: ShieldCheck,
    },
    {
      id: "compliance-nist" as ViewTab,
      label: "NIST CSF 2.0 Framework",
      icon: CheckSquare,
    },
    {
      id: "assets" as ViewTab,
      label: "Asset Inventory",
      icon: Server,
    },
    {
      id: "evidence" as ViewTab,
      label: "Audit Evidence Vault",
      icon: FolderLock,
    },
    {
      id: "incidents" as ViewTab,
      label: "Security Incidents",
      icon: AlertOctagon,
      badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
    },
    {
      id: "ai-advisor" as ViewTab,
      label: "AI SOC Threat Advisor",
      icon: Sparkles,
    },
  ];

  const handleSelect = (id: ViewTab) => {
    onSelectTab(id);
    if (isMobile) {
      onClose();
    }
  };

  // If Mobile or Narrow aspect ratio: render slide-over modal overlay drawer
  if (isMobile) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop overlay */}
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Slide-over Drawer Panel */}
        <aside className="relative w-72 max-w-[85vw] bg-slate-950 border-r border-violet-900/40 text-slate-300 flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
          <div className="p-4 flex items-center justify-between border-b border-violet-900/30">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <span className="font-extrabold text-base font-mono text-gradient-violet">CygrX Command</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 text-xs font-mono flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-rose-400" /> Mobile
            </span>
            <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-500/30 font-bold">
              TOUCH DECK
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-1.5 custom-scrollbar">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest font-mono">
                NAVIGATION MODULES
              </p>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all group font-mono cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-violet-950/90 via-slate-900 to-slate-900 text-violet-300 font-bold border border-violet-500/40"
                      : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-slate-400"}`} />
                    <span className="truncate text-left">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-violet-900/30 text-xs font-mono text-slate-500 flex items-center justify-between bg-slate-950/90">
            <span>MOBILE TELEMETRY</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
        </aside>
      </div>
    );
  }

  // Desktop Mode: Expandable (w-64) or Collapsed Mini-Rail (w-16)
  return (
    <aside 
      className={`bg-slate-950/95 border-r border-violet-900/30 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] relative transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="p-3 flex-1 flex flex-col">
        {/* Toggle Collapse Button Header inside Sidebar */}
        <div className={`flex items-center mb-3 px-2 ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen ? (
            <>
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest font-mono flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                CYBER MODULES
              </p>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-violet-300 transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-violet-400 border border-violet-500/30 transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                title={!isOpen ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group font-mono relative overflow-hidden cursor-pointer ${
                  isOpen ? "justify-between px-3.5 py-2.5" : "justify-center p-3"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-violet-950/80 via-slate-900 to-slate-900 text-violet-300 font-bold border border-violet-500/40"
                    : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-violet-400" />
                )}
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-all ${isActive ? "text-violet-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                  {isOpen && <span className="truncate">{item.label}</span>}
                </div>

                {isOpen && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-rose-500 text-white font-mono">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "text-violet-400 rotate-90" : "text-slate-600 opacity-0 group-hover:opacity-100"}`} />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Telemetry Health Module - shown when sidebar expanded */}
        {isOpen && (
          <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-violet-500/20 text-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> THREAT DEFENSE
              </span>
              <span className="text-violet-400 font-bold font-mono text-sm">99.8%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 p-0.5 border border-violet-900/40 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 h-1 rounded-full transition-all duration-1000" style={{ width: "99.8%" }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Node Identifier */}
      <div className={`p-3 border-t border-violet-900/30 text-xs font-mono text-slate-500 flex items-center bg-slate-950/80 ${isOpen ? "justify-between" : "justify-center"}`}>
        {isOpen ? (
          <>
            <span className="text-slate-400 truncate">NODE: <span className="text-violet-400 font-bold">CYBER-SOC-01</span></span>
            <span className="flex items-center gap-1.5 text-violet-400 font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              ENCRYPTED
            </span>
          </>
        ) : (
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" title="NODE CYBER-SOC-01 ENCRYPTED" />
        )}
      </div>
    </aside>
  );
};

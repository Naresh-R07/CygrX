import React, { useState } from "react";
import { 
  ShieldCheck, 
  CheckSquare, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Link2
} from "lucide-react";
import { Control, ComplianceStatus, Evidence, FrameworkType } from "../types";

interface ComplianceTrackerProps {
  framework: FrameworkType;
  controls: Control[];
  evidences: Evidence[];
  onUpdateControlStatus: (controlId: string, status: ComplianceStatus) => void;
  onRequestAiGapAnalysis: (control: Control) => void;
}

export const ComplianceTracker: React.FC<ComplianceTrackerProps> = ({
  framework,
  controls,
  evidences,
  onUpdateControlStatus,
  onRequestAiGapAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  const isIso = framework === "ISO_27001";
  const title = isIso ? "ISO 27001:2022 Annex A Governance Matrix" : "NIST CSF 2.0 Core Function Tracker";
  const subtitle = isIso
    ? "Standardized ISO 27001 information security controls, audit readiness, and evidence linkage."
    : "NIST Cybersecurity Framework Functions: Identify, Protect, Detect, Respond, Recover.";

  const total = controls.length;
  const implemented = controls.filter((c) => c.status === "FULLY_IMPLEMENTED").length;
  const partial = controls.filter((c) => c.status === "PARTIALLY_IMPLEMENTED").length;
  const notImplemented = controls.filter((c) => c.status === "NOT_IMPLEMENTED").length;
  const readinessPercentage = Math.round((implemented / total) * 100) || 0;

  // Only count evidence linked to controls in THIS framework
  const frameworkControlIds = new Set(controls.map((c) => c.id));
  const linkedEvidenceCount = evidences.filter((ev) =>
    ev.linkedControlIds.some((id) => frameworkControlIds.has(id))
  ).length;

  // Filter controls
  const filteredControls = controls.filter((ctl) => {
    if (selectedStatusFilter !== "ALL" && ctl.status !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchId = ctl.controlId.toLowerCase().includes(q);
      const matchTitle = ctl.title.toLowerCase().includes(q);
      const matchDesc = ctl.description.toLowerCase().includes(q);
      const matchCategory = ctl.category.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchDesc && !matchCategory) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 cyber-card p-6 rounded-3xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl border ${isIso ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-400 shadow-sm" : "bg-violet-950/80 border-violet-500/40 text-violet-400 shadow-sm"}`}>
            {isIso ? <ShieldCheck className="w-8 h-8" /> : <CheckSquare className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                FRAMEWORK COMPLIANCE ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-950/80 text-violet-300 border border-violet-500/30 font-mono">
                {isIso ? "Annex A (2022)" : "NIST CSF 2.0"}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight font-mono mt-0.5 text-gradient-violet">{title}</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl font-mono">{subtitle}</p>
          </div>
        </div>

        {/* Readiness Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/90 border border-violet-900/30 px-5 py-3 rounded-2xl shadow-md">
          <div className="text-right font-mono">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">AUDIT READINESS</span>
            <span className="text-2xl font-black text-white">{readinessPercentage}%</span>
          </div>
          <div className="w-16 h-16 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="6" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke={isIso ? "#10b981" : "#8b5cf6"}
                strokeWidth="6"
                strokeDasharray={163}
                strokeDashoffset={163 - (163 * readinessPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-200 font-mono">{implemented}/{total}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Fully Implemented</span>
            <span className="text-2xl font-extrabold text-emerald-400 block mt-1">{implemented}</span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">In Progress / Partial</span>
            <span className="text-2xl font-extrabold text-amber-400 block mt-1">{partial}</span>
          </div>
          <Clock className="w-6 h-6 text-amber-500/40" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Not Implemented</span>
            <span className="text-2xl font-extrabold text-rose-400 block mt-1">{notImplemented}</span>
          </div>
          <AlertCircle className="w-6 h-6 text-rose-500/40" />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Audit Evidence Attached</span>
            <span className="text-2xl font-extrabold text-cyan-400 block mt-1">
              {linkedEvidenceCount} Files
            </span>
          </div>
          <FileText className="w-6 h-6 text-cyan-500/40" />
        </div>
      </div>

      {/* Control Search & List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        
        {/* Controls Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">Framework Security Controls</h2>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-300">
              {filteredControls.length} Controls
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search control ID, title, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Statuses</option>
              <option value="FULLY_IMPLEMENTED" className="bg-slate-900 text-slate-200">Fully Implemented</option>
              <option value="PARTIALLY_IMPLEMENTED" className="bg-slate-900 text-slate-200">Partially Implemented</option>
              <option value="NOT_IMPLEMENTED" className="bg-slate-900 text-slate-200">Not Implemented</option>
            </select>
          </div>
        </div>

        {/* Control Item Cards */}
        <div className="space-y-4">
          {filteredControls.map((control) => {
            const linkedEvidences = evidences.filter((ev) => ev.linkedControlIds.includes(control.id));
            const isFully = control.status === "FULLY_IMPLEMENTED";
            const isPartial = control.status === "PARTIALLY_IMPLEMENTED";
            const isNot = control.status === "NOT_IMPLEMENTED";

            return (
              <div
                key={control.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-extrabold text-xs tracking-wide">
                      {control.controlId}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{control.title}</h3>
                      <span className="text-xs font-medium text-slate-400">{control.category}</span>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={control.status}
                      onChange={(e) => onUpdateControlStatus(control.id, e.target.value as ComplianceStatus)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold border focus:outline-none ${
                        isFully
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : isPartial
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                          : "bg-rose-500/10 border-rose-500/40 text-rose-400"
                      }`}
                    >
                      <option value="FULLY_IMPLEMENTED" className="bg-slate-900 text-slate-200">Fully Implemented</option>
                      <option value="PARTIALLY_IMPLEMENTED" className="bg-slate-900 text-slate-200">Partially Implemented</option>
                      <option value="NOT_IMPLEMENTED" className="bg-slate-900 text-slate-200">Not Implemented</option>
                      <option value="NOT_APPLICABLE" className="bg-slate-900 text-slate-200">N/A (Not Applicable)</option>
                    </select>

                    <button
                      onClick={() => onRequestAiGapAnalysis(control)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      AI Gap Fix
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {control.description}
                </p>

                {/* Audit Notes & Linked Evidence */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="text-slate-400">
                    <strong>Owner:</strong> <span className="text-slate-200">{control.owner}</span>
                    {control.notes && (
                      <span className="ml-3 text-slate-400 italic font-normal">
                        "{control.notes}"
                      </span>
                    )}
                  </div>

                  {/* Linked evidence pill */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Evidence Vault:</span>
                    {linkedEvidences.length > 0 ? (
                      linkedEvidences.map((ev) => (
                        <span
                          key={ev.id}
                          className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-medium flex items-center gap-1"
                        >
                          <Link2 className="w-3 h-3 text-cyan-400" />
                          {ev.fileName}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-xs">No evidence file uploaded</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

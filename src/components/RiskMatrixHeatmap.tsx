import React, { useState } from "react";
import { 
  Grid3X3, 
  PlusCircle, 
  Search, 
  Sparkles 
} from "lucide-react";
import { Risk, RiskLevel, RiskStatus } from "../types";
import { calculateRiskScore, getHeatmapCellColor } from "../utils/riskEngine";

interface RiskMatrixHeatmapProps {
  risks: Risk[];
  onOpenNewRiskModal: () => void;
  onSelectRisk: (risk: Risk) => void;
  onUpdateRiskStatus: (riskId: string, status: RiskStatus) => void;
  onRequestAiAdvice: (risk: Risk) => void;
}

export const RiskMatrixHeatmap: React.FC<RiskMatrixHeatmapProps> = ({
  risks,
  onOpenNewRiskModal,
  onSelectRisk,
  onUpdateRiskStatus,
  onRequestAiAdvice,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ likelihood: number; impact: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  // 5x5 Matrix indexes (Likelihood 5 to 1 on Y-axis, Impact 1 to 5 on X-axis)
  const likelihoods = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];

  const likelihoodLabels: Record<number, string> = {
    5: "5 - Almost Certain",
    4: "4 - Likely",
    3: "3 - Possible",
    2: "2 - Unlikely",
    1: "1 - Rare",
  };

  const impactLabels: Record<number, string> = {
    1: "1 - Negligible",
    2: "2 - Minor",
    3: "3 - Moderate",
    4: "4 - Major",
    5: "5 - Catastrophic",
  };

  // Filter risks based on search, cell filter, status, level
  const filteredRisks = risks.filter((risk) => {
    if (selectedCell) {
      if (risk.likelihood !== selectedCell.likelihood || risk.impact !== selectedCell.impact) {
        return false;
      }
    }

    if (selectedStatus !== "ALL" && risk.status !== selectedStatus) {
      return false;
    }

    if (selectedLevel !== "ALL" && risk.riskLevel !== selectedLevel) {
      return false;
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = risk.title.toLowerCase().includes(q);
      const matchDesc = risk.description.toLowerCase().includes(q);
      const matchAsset = (risk.assetName || "").toLowerCase().includes(q);
      const matchAssignee = risk.assignee.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAsset && !matchAssignee) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cyber-card p-6 rounded-3xl relative overflow-hidden">
        <div>
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
            CYGRX THREAT HEATMAP ENGINE
          </span>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 font-mono mt-0.5 text-gradient-violet">
            <Grid3X3 className="w-5 h-5 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            5x5 Risk Matrix & Threat Heatmap
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Enterprise threat severity matrix (Risk Score = Likelihood × Impact). Click matrix cells to filter active risk vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedCell && (
            <button
              onClick={() => setSelectedCell(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold font-mono bg-slate-900 hover:bg-slate-800 text-violet-300 border border-violet-800 transition-all cursor-pointer"
            >
              Reset Cell Filter
            </button>
          )}
          <button
            onClick={onOpenNewRiskModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] border border-violet-400/40 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Threat Risk
          </button>
        </div>
      </div>

      {/* 5x5 Heatmap Matrix Section */}
      <div className="cyber-card p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white font-mono">5x5 Enterprise Threat Matrix Grid</span>
            <span className="text-xs text-slate-400 font-mono">(Y-Axis: Likelihood | X-Axis: Impact)</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-400" />
              <span className="text-slate-300">Low (1-4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400" />
              <span className="text-slate-300">Medium (5-9)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-500/30 border border-orange-400" />
              <span className="text-slate-300">High (10-15)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-400" />
              <span className="text-slate-300">Critical (16-25)</span>
            </div>
          </div>
        </div>

        {/* Matrix Layout */}
        <div className="overflow-x-auto pt-2 pb-2">
          <div className="min-w-[640px]">
            
            {/* Rows for Likelihood (5 down to 1) */}
            {likelihoods.map((l) => (
              <div key={`lh-${l}`} className="flex items-center gap-2 mb-2">
                {/* Y-Axis Label */}
                <div className="w-40 shrink-0 text-right pr-3 text-xs font-semibold text-slate-400">
                  {likelihoodLabels[l]}
                </div>

                {/* Columns for Impact (1 to 5) */}
                <div className="grid grid-cols-5 gap-2 flex-1">
                  {impacts.map((imp) => {
                    const cellRisks = risks.filter((r) => r.likelihood === l && r.impact === imp);
                    const isSelected = selectedCell?.likelihood === l && selectedCell?.impact === imp;
                    const cellColorClass = getHeatmapCellColor(l, imp, cellRisks.length);
                    const score = l * imp;

                    return (
                      <button
                        key={`cell-${l}-${imp}`}
                        onClick={() => {
                          if (isSelected) setSelectedCell(null);
                          else setSelectedCell({ likelihood: l, impact: imp });
                        }}
                        className={`h-16 rounded-xl border p-2 flex flex-col justify-between transition-all relative ${cellColorClass} ${
                          isSelected ? "ring-2 ring-cyan-400 border-cyan-400 scale-[1.02] z-10" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between w-full text-[10px] font-bold opacity-80">
                          <span>Score {score}</span>
                          {cellRisks.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-950/80 text-white font-extrabold border border-white/20">
                              {cellRisks.length}
                            </span>
                          )}
                        </div>
                        <div className="text-right text-[11px] font-extrabold tracking-tight">
                          {cellRisks.length > 0 ? `${cellRisks.length} Risk${cellRisks.length > 1 ? "s" : ""}` : "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* X-Axis Footer Label */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
              <div className="w-40 shrink-0 text-right pr-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Impact →
              </div>
              <div className="grid grid-cols-5 gap-2 flex-1 text-center text-xs font-semibold text-slate-400">
                {impacts.map((imp) => (
                  <div key={`imp-lbl-${imp}`}>{impactLabels[imp]}</div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Filter & Risk Register Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        
        {/* Table Filters Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">Risk Register Inventory</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-cyan-400 border border-slate-700">
              {filteredRisks.length} Items
            </span>
            {selectedCell && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Filtered: L{selectedCell.likelihood} × I{selectedCell.impact}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter risk title, asset, assignee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="MITIGATED">Mitigated</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>

            {/* Severity Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severity Levels</option>
              <option value="CRITICAL">Critical (16-25)</option>
              <option value="HIGH">High (10-15)</option>
              <option value="MEDIUM">Medium (5-9)</option>
              <option value="LOW">Low (1-4)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Risk Title & Details</th>
                <th className="py-3 px-4">Affected Asset</th>
                <th className="py-3 px-4 text-center">Likelihood</th>
                <th className="py-3 px-4 text-center">Impact</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No risk items found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk) => {
                  const scoreMeta = calculateRiskScore(risk.likelihood, risk.impact);
                  return (
                    <tr 
                      key={risk.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {risk.title}
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1 max-w-md mt-0.5">
                          {risk.description}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {risk.assetName || "Organization-wide"}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                        {risk.likelihood}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-300">
                        {risk.impact}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold ${scoreMeta.badgeBg}`}>
                          {risk.riskScore} ({risk.riskLevel})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={risk.status}
                          onChange={(e) => onUpdateRiskStatus(risk.id, e.target.value as RiskStatus)}
                          className="bg-slate-950 border border-slate-700/80 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="OPEN">Open</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="MITIGATED">Mitigated</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="TRANSFERRED">Transferred</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {risk.assignee}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => onRequestAiAdvice(risk)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all inline-flex items-center gap-1"
                          title="Get AI ISO/NIST Controls Recommendation"
                        >
                          <Sparkles className="w-3 h-3 text-purple-300" />
                          AI Advice
                        </button>

                        <button
                          onClick={() => onSelectRisk(risk)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

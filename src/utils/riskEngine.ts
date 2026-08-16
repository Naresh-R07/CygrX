import { Risk, RiskLevel } from "../types";

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  badgeBg: string;
  badgeText: string;
}

export function calculateRiskScore(likelihood: number, impact: number): RiskScoreResult {
  const score = Math.min(25, Math.max(1, likelihood * impact));

  if (score <= 4) {
    return {
      score,
      level: "LOW",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      badgeText: "Low Risk",
    };
  } else if (score <= 9) {
    return {
      score,
      level: "MEDIUM",
      badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      badgeText: "Medium Risk",
    };
  } else if (score <= 15) {
    return {
      score,
      level: "HIGH",
      badgeBg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      badgeText: "High Risk",
    };
  } else {
    return {
      score,
      level: "CRITICAL",
      badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      badgeText: "Critical Risk",
    };
  }
}

export function getHeatmapCellColor(likelihood: number, impact: number, count: number): string {
  const score = likelihood * impact;
  if (count === 0) {
    if (score >= 16) return "bg-rose-950/20 border-rose-900/40 text-slate-500 hover:bg-rose-900/30";
    if (score >= 10) return "bg-orange-950/20 border-orange-900/40 text-slate-500 hover:bg-orange-900/30";
    if (score >= 5) return "bg-amber-950/20 border-amber-900/40 text-slate-500 hover:bg-amber-900/30";
    return "bg-emerald-950/20 border-emerald-900/40 text-slate-500 hover:bg-emerald-900/30";
  }

  if (score >= 16) return "bg-rose-600/25 border-rose-500 text-rose-300 shadow-lg hover:bg-rose-600/40";
  if (score >= 10) return "bg-orange-600/25 border-orange-500 text-orange-300 shadow-lg hover:bg-orange-600/40";
  if (score >= 5) return "bg-amber-600/25 border-amber-500 text-amber-300 shadow-lg hover:bg-amber-600/40";
  return "bg-emerald-600/25 border-emerald-500 text-emerald-300 shadow-lg hover:bg-emerald-600/40";
}

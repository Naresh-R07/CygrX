import React from "react";
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar,
  FileCheck2
} from "lucide-react";
import { Risk, Control, Asset, Incident } from "../types";

interface ExecutiveReportViewProps {
  risks: Risk[];
  assets: Asset[];
  isoControls: Control[];
  nistControls: Control[];
  incidents: Incident[];
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({
  risks,
  assets,
  isoControls,
  nistControls,
  incidents,
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalRisks = risks.length;
  const criticalRisks = risks.filter((r) => r.riskScore >= 16);
  const highRisks = risks.filter((r) => r.riskScore >= 10 && r.riskScore < 16);
  const mitigatedRisks = risks.filter((r) => r.status === "MITIGATED");

  const isoImplemented = isoControls.filter((c) => c.status === "FULLY_IMPLEMENTED").length;
  const isoScore = Math.round((isoImplemented / isoControls.length) * 100) || 0;

  const nistImplemented = nistControls.filter((c) => c.status === "FULLY_IMPLEMENTED").length;
  const nistScore = Math.round((nistImplemented / nistControls.length) * 100) || 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      reportTitle: "Executive Cybersecurity GRC Audit Briefing",
      organization: "Acme Corp (Global Enterprise Ops)",
      date: currentDate,
      iso27001Readiness: `${isoScore}%`,
      nistCsfMaturity: `${nistScore}%`,
      risks,
      assets,
      incidents,
    }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GRC-Executive-Report-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Print Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            Executive Cyber Security Audit Briefing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Board-ready executive briefing summarizing enterprise threat exposure, ISO 27001 / NIST readiness, and audit evidence posture.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export Data
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Executive Document Canvas */}
      <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b-2 border-cyan-500 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-8 h-8 text-cyan-400 print:text-cyan-700" />
              <h1 className="text-2xl font-extrabold text-white print:text-slate-900 tracking-tight">
                AEGIS CYBERSECURITY GRC AUDIT BRIEFING
              </h1>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Confidential — For Board of Directors & Lead Auditor Review
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 print:text-slate-600 space-y-1">
            <div className="flex items-center justify-end gap-1.5 font-bold text-slate-200 print:text-slate-900">
              <Building2 className="w-3.5 h-3.5" />
              Acme Corp Global Ops
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {currentDate}
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ISO 27001 Readiness</span>
            <span className="text-2xl font-extrabold text-emerald-400 print:text-emerald-700 block mt-1">{isoScore}%</span>
            <span className="text-[11px] text-slate-400 print:text-slate-600">{isoImplemented}/{isoControls.length} Controls Implemented</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NIST CSF 2.0 Maturity</span>
            <span className="text-2xl font-extrabold text-cyan-400 print:text-cyan-700 block mt-1">{nistScore}%</span>
            <span className="text-[11px] text-slate-400 print:text-slate-600">{nistImplemented}/{nistControls.length} Controls Implemented</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical Threat Exposure</span>
            <span className="text-2xl font-extrabold text-rose-400 print:text-rose-700 block mt-1">{criticalRisks.length}</span>
            <span className="text-[11px] text-slate-400 print:text-slate-600">Out of {totalRisks} Total Risks</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tracked Cloud Assets</span>
            <span className="text-2xl font-extrabold text-purple-400 print:text-purple-700 block mt-1">{assets.length}</span>
            <span className="text-[11px] text-slate-400 print:text-slate-600">{incidents.length} Active Incidents</span>
          </div>
        </div>

        {/* Section 1: Top Critical Risks */}
        <div className="mb-8 space-y-3">
          <h2 className="text-base font-bold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-2">
            1. Priority Threat Heatmap Exposure Register
          </h2>
          
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 print:border-slate-400 text-slate-400 print:text-slate-700 font-bold uppercase text-[10px]">
                <th className="py-2">Risk Title</th>
                <th className="py-2">Category</th>
                <th className="py-2 text-center">Likelihood</th>
                <th className="py-2 text-center">Impact</th>
                <th className="py-2 text-center">Risk Score</th>
                <th className="py-2">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
              {risks.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 font-semibold text-slate-200 print:text-slate-900">{r.title}</td>
                  <td className="py-2.5 text-slate-400 print:text-slate-700">{r.category}</td>
                  <td className="py-2.5 text-center font-bold text-slate-300 print:text-slate-800">{r.likelihood}</td>
                  <td className="py-2.5 text-center font-bold text-slate-300 print:text-slate-800">{r.impact}</td>
                  <td className="py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      r.riskScore >= 16 ? "bg-rose-500/10 text-rose-400 border-rose-500/30 print:text-rose-700" : "bg-amber-500/10 text-amber-400 border-amber-500/30 print:text-amber-700"
                    }`}>
                      {r.riskScore} ({r.riskLevel})
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400 print:text-slate-700">{r.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 2: Framework Control Status */}
        <div className="mb-8 space-y-3">
          <h2 className="text-base font-bold text-white print:text-slate-900 border-b border-slate-800 print:border-slate-300 pb-2">
            2. ISO 27001 & NIST CSF Control Audit Mapping
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ISO Summary */}
            <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 print:text-emerald-700 uppercase tracking-wide">
                ISO 27001:2022 Controls Overview
              </h3>
              {isoControls.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 print:border-slate-200">
                  <span className="font-semibold text-slate-300 print:text-slate-900">{c.controlId} - {c.title}</span>
                  <span className={`text-[10px] font-bold ${c.status === "FULLY_IMPLEMENTED" ? "text-emerald-400 print:text-emerald-700" : "text-amber-400 print:text-amber-700"}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>

            {/* NIST Summary */}
            <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2">
              <h3 className="text-xs font-bold text-cyan-400 print:text-cyan-700 uppercase tracking-wide">
                NIST CSF 2.0 Core Functions Overview
              </h3>
              {nistControls.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 print:border-slate-200">
                  <span className="font-semibold text-slate-300 print:text-slate-900">{c.controlId} - {c.title}</span>
                  <span className={`text-[10px] font-bold ${c.status === "FULLY_IMPLEMENTED" ? "text-emerald-400 print:text-emerald-700" : "text-amber-400 print:text-amber-700"}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Sign-Off Block */}
        <div className="pt-8 border-t border-slate-800 print:border-slate-400 grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-slate-700">
          <div>
            <div className="h-10 border-b border-slate-700 print:border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-200 print:text-slate-900">Chief Information Security Officer (CISO)</p>
            <p>Acme Corp Information Security</p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-700 print:border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-200 print:text-slate-900">Lead ISO 27001 Lead Auditor</p>
            <p>Independent Cyber Risk Audit Body</p>
          </div>
        </div>

      </div>

    </div>
  );
};

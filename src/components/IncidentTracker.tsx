import React, { useState } from "react";
import { 
  AlertOctagon, 
  PlusCircle, 
  Clock, 
  Search, 
  X 
} from "lucide-react";
import { Incident, IncidentSeverity, IncidentStatus, Asset } from "../types";

interface IncidentTrackerProps {
  incidents: Incident[];
  assets: Asset[];
  onAddIncident: (incident: Partial<Incident>) => void;
  onUpdateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
}

export const IncidentTracker: React.FC<IncidentTrackerProps> = ({
  incidents,
  assets,
  onAddIncident,
  onUpdateIncidentStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>("ALL");
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity>("HIGH");
  const [assetId, setAssetId] = useState("");
  const [reporter, setReporter] = useState("Security Operations Center");
  const [rootCause, setRootCause] = useState("");

  const filteredIncidents = incidents.filter((inc) => {
    if (selectedSeverityFilter !== "ALL" && inc.severity !== selectedSeverityFilter) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchDesc = inc.description.toLowerCase().includes(q);
      const matchReporter = inc.reporter.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchReporter) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "HIGH":
        return "bg-orange-500/10 border-orange-500/30 text-orange-400";
      case "MEDIUM":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "LOW":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    }
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetAsset = assets.find((a) => a.id === assetId);

    onAddIncident({
      id: `inc-${Date.now()}`,
      title,
      description,
      severity,
      status: "NEW",
      assetId,
      assetName: targetAsset?.name || "Global Cloud Infrastructure",
      reporter,
      reportedAt: `${new Date().toISOString().split("T")[0]} ${new Date().toLocaleTimeString()} UTC`,
      rootCause: rootCause || "Triage in progress by SOC team.",
      actionItems: ["Initiate incident command playbook", "Isolate affected subnet"],
    });

    setTitle("");
    setDescription("");
    setRootCause("");
    setIsNewIncidentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            Security Incident Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cybersecurity incident logging, forensic triage, containment workflow, and NIST RS response.
          </p>
        </div>

        <button
          onClick={() => setIsNewIncidentModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 border border-rose-400/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Log Security Incident
        </button>
      </div>

      {/* Incident List Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">Active Incident Response Queue</h2>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-rose-400 border border-slate-700">
              {filteredIncidents.length} Incidents
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter title, reporter, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={selectedSeverityFilter}
              onChange={(e) => setSelectedSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Incident Queue Cards */}
        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const isClosed = incident.status === "CLOSED";
            return (
              <div
                key={incident.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold ${getSeverityBadge(incident.severity)}`}>
                      {incident.severity}
                    </span>
                    <h3 className="text-sm font-bold text-white">{incident.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-slate-400">Status:</span>
                    <select
                      value={incident.status}
                      onChange={(e) => onUpdateIncidentStatus(incident.id, e.target.value as IncidentStatus)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold border focus:outline-none ${
                        isClosed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      }`}
                    >
                      <option value="NEW">NEW</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="CONTAINED">CONTAINED</option>
                      <option value="ERADICATED">ERADICATED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{incident.description}</p>

                {incident.rootCause && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-rose-400">Root Cause Triage:</strong> {incident.rootCause}
                  </div>
                )}

                {/* Action items */}
                {incident.actionItems && incident.actionItems.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Containment Playbook Actions:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {incident.actionItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div>
                    Affected Asset: <strong className="text-slate-300">{incident.assetName || "Global Infrastructure"}</strong>
                  </div>
                  <div>
                    Reported by <strong className="text-slate-400">{incident.reporter}</strong> at {incident.reportedAt}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* New Incident Modal */}
      {isNewIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                Declare Security Incident
              </h2>
              <button
                onClick={() => setIsNewIncidentModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unusual API credential brute-force attack from foreign IP block"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Affected Asset</label>
                  <select
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Select Asset --</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Details & Observations</label>
                <textarea
                  rows={3}
                  placeholder="Include IP logs, time of detection, anomaly metrics, affected services..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preliminary Root Cause</label>
                <input
                  type="text"
                  placeholder="e.g. Compromised contractor API token or unpatched software vulnerability"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewIncidentModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 border border-rose-400/30"
                >
                  Log Incident
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from "react";
import { 
  FolderLock, 
  UploadCloud, 
  FileText, 
  Link2, 
  Download, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  Search, 
  X,
  FileCheck,
  ExternalLink
} from "lucide-react";
import { Evidence, Control } from "../types";

interface EvidenceVaultProps {
  evidences: Evidence[];
  isoControls: Control[];
  nistControls: Control[];
  onAddEvidence: (evidence: Partial<Evidence>) => void;
  onDeleteEvidence: (evidenceId: string) => void;
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({
  evidences,
  isoControls,
  nistControls,
  onAddEvidence,
  onDeleteEvidence,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("1.5 MB");
  const [uploadedBy, setUploadedBy] = useState("Sarah Jenkins (GRC Specialist)");
  const [selectedControlIds, setSelectedControlIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const allControls = [...isoControls, ...nistControls];

  const filteredEvidences = evidences.filter((ev) => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchFile = ev.fileName.toLowerCase().includes(q);
      const matchUploader = ev.uploadedBy.toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchUploader) return false;
    }
    return true;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setTitle(file.name.replace(/\.[^/.]+$/, "") + " Audit Artifact");
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      setFileSize(`${mb} MB`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setTitle(file.name.replace(/\.[^/.]+$/, "") + " Audit Artifact");
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      setFileSize(`${mb} MB`);
    }
  };

  const handleToggleControl = (controlId: string) => {
    if (selectedControlIds.includes(controlId)) {
      setSelectedControlIds(selectedControlIds.filter((id) => id !== controlId));
    } else {
      setSelectedControlIds([...selectedControlIds, controlId]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileName.trim()) return;

    onAddEvidence({
      id: `ev-${Date.now()}`,
      title,
      fileName,
      fileSize,
      fileType: fileName.endsWith(".pdf") ? "application/pdf" : fileName.endsWith(".csv") ? "text/csv" : "image/png",
      uploadedBy,
      uploadedAt: new Date().toISOString().split("T")[0],
      linkedControlIds: selectedControlIds,
      notes: notes || "Uploaded into central MinIO S3 Audit Vault.",
    });

    // Reset
    setTitle("");
    setFileName("");
    setSelectedControlIds([]);
    setNotes("");
    setIsUploadModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-cyan-400" />
            Central Audit Evidence Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Secure, immutable audit artifact repository backed by MinIO S3 object storage for ISO 27001 & NIST CSF proof.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/30 transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Evidence Artifact
        </button>
      </div>

      {/* File Vault Inventory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">Uploaded Compliance Artifacts</h2>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-cyan-400 border border-slate-700">
              {filteredEvidences.length} Artifacts
            </span>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter artifact title, file name, uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Evidence List */}
        <div className="space-y-3">
          {filteredEvidences.map((evidence) => {
            const linkedControls = allControls.filter((c) => evidence.linkedControlIds.includes(c.id));
            return (
              <div
                key={evidence.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-xs">{evidence.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-400 border border-slate-700">
                        {evidence.fileSize}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-slate-400">{evidence.fileName}</p>

                    {evidence.notes && (
                      <p className="text-[11px] text-slate-400 italic">{evidence.notes}</p>
                    )}

                    {/* Linked Controls Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-semibold">Linked Controls:</span>
                      {linkedControls.length > 0 ? (
                        linkedControls.map((c) => (
                          <span
                            key={c.id}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          >
                            {c.controlId} ({c.title})
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto text-xs">
                  <div className="text-right text-[11px] text-slate-400 hidden sm:block">
                    <div>Uploaded by {evidence.uploadedBy}</div>
                    <div className="text-slate-500">{evidence.uploadedAt}</div>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Downloading presigned file link for ${evidence.fileName}...`);
                    }}
                    className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>

                  <button
                    onClick={() => onDeleteEvidence(evidence.id)}
                    className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Upload Evidence Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                Upload Audit Evidence Artifact
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  dragActive
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-200 mb-1">
                  Drag and drop proof files here, or click to browse
                </p>
                <p className="text-xs text-slate-400 mb-3">Supports PDF, CSV, PNG, JPG, JSON (Max 50MB)</p>

                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload-input"
                />
                <label
                  htmlFor="file-upload-input"
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer inline-block"
                >
                  Select Local File
                </label>

                {fileName && (
                  <div className="mt-3 p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 font-mono text-xs">
                    Selected: {fileName} ({fileSize})
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Artifact Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 2026 Tenable Vulnerability Scan Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Link Controls */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Link to ISO 27001 / NIST Controls
                </label>
                <div className="max-h-36 overflow-y-auto border border-slate-800 rounded-lg p-2 space-y-1 bg-slate-950">
                  {allControls.map((c) => {
                    const isChecked = selectedControlIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        onClick={() => handleToggleControl(c.id)}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs ${
                          isChecked ? "bg-cyan-500/10 text-cyan-300" : "hover:bg-slate-900 text-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded accent-cyan-500"
                        />
                        <span className="font-bold text-cyan-400">{c.controlId}</span>
                        <span>{c.title} ({c.framework})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Auditor Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or verification instructions for ISO lead auditor..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg border border-cyan-400/30"
                >
                  Save Artifact
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from "react";
import { X, ShieldAlert } from "lucide-react";
import { Asset, Risk, RiskStatus } from "../types";
import { calculateRiskScore } from "../utils/riskEngine";

interface RiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRisk: (riskData: Partial<Risk>) => void;
  assets: Asset[];
  editingRisk?: Risk | null;
}

export const RiskModal: React.FC<RiskModalProps> = ({
  isOpen,
  onClose,
  onSaveRisk,
  assets,
  editingRisk,
}) => {
  const [title, setTitle] = useState(editingRisk?.title || "");
  const [description, setDescription] = useState(editingRisk?.description || "");
  const [likelihood, setLikelihood] = useState<number>(editingRisk?.likelihood || 3);
  const [impact, setImpact] = useState<number>(editingRisk?.impact || 3);
  const [category, setCategory] = useState<Risk["category"]>(editingRisk?.category || "Technical");
  const [assetId, setAssetId] = useState(editingRisk?.assetId || "");
  const [assignee, setAssignee] = useState(editingRisk?.assignee || "Security Ops Team");
  const [mitigationPlan, setMitigationPlan] = useState(editingRisk?.mitigationPlan || "");
  const [status, setStatus] = useState<RiskStatus>(editingRisk?.status || "OPEN");

  useEffect(() => {
    if (isOpen) {
      setTitle(editingRisk?.title || "");
      setDescription(editingRisk?.description || "");
      setLikelihood(editingRisk?.likelihood || 3);
      setImpact(editingRisk?.impact || 3);
      setCategory(editingRisk?.category || "Technical");
      setAssetId(editingRisk?.assetId || "");
      setAssignee(editingRisk?.assignee || "Security Ops Team");
      setMitigationPlan(editingRisk?.mitigationPlan || "");
      setStatus(editingRisk?.status || "OPEN");
    }
  }, [isOpen, editingRisk]);

  if (!isOpen) return null;

  const scoreMeta = calculateRiskScore(likelihood, impact);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAsset = assets.find((a) => a.id === assetId);

    onSaveRisk({
      id: editingRisk?.id,
      title,
      description,
      likelihood,
      impact,
      riskScore: scoreMeta.score,
      riskLevel: scoreMeta.level,
      category,
      assetId,
      assetName: selectedAsset?.name || "General Architecture",
      assignee,
      mitigationPlan,
      status,
      targetFrameworkControls: editingRisk?.targetFrameworkControls || ["ISO 27001 A.8.8", "NIST PR.IP-1"],
      updatedAt: new Date().toISOString().split("T")[0],
      createdAt: editingRisk?.createdAt || new Date().toISOString().split("T")[0],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              {editingRisk ? "Edit Cybersecurity Risk Profile" : "Register New Security Threat / Risk"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Risk Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unpatched Remote Code Execution in API Gateway microservice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Detailed Threat Scenario & Description</label>
            <textarea
              rows={3}
              placeholder="Describe threat vectors, vulnerabilities, likelihood factors, and potential loss..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category & Asset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Risk Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Risk["category"])}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Technical">Technical / Cyber</option>
                <option value="Organizational">Organizational / Process</option>
                <option value="Physical">Physical Security</option>
                <option value="Legal/Compliance">Legal & Regulatory</option>
                <option value="Third-Party">Third-Party & Vendor</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Associated Asset</label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Select Asset (Optional) --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5x5 Matrix Likelihood & Impact Sliders */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200">Dynamic 5x5 Severity Calculator</span>
              <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${scoreMeta.badgeBg}`}>
                Score: {scoreMeta.score}/25 ({scoreMeta.level})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Likelihood */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Likelihood: <strong>{likelihood}/5</strong></span>
                  <span className="text-slate-500">
                    {likelihood === 5 ? "Almost Certain" : likelihood === 4 ? "Likely" : likelihood === 3 ? "Possible" : likelihood === 2 ? "Unlikely" : "Rare"}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={likelihood}
                  onChange={(e) => setLikelihood(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Impact */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Impact: <strong>{impact}/5</strong></span>
                  <span className="text-slate-500">
                    {impact === 5 ? "Catastrophic" : impact === 4 ? "Major" : impact === 3 ? "Moderate" : impact === 2 ? "Minor" : "Negligible"}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={impact}
                  onChange={(e) => setImpact(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Assignee & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Risk Owner / Assignee</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="e.g. Alex Rivera (DevOps Lead)"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RiskStatus)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="MITIGATED">Mitigated</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </div>
          </div>

          {/* Mitigation Strategy */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Mitigation Plan & Technical Controls</label>
            <textarea
              rows={3}
              placeholder="Specify technical controls, patching steps, policy updates, and target dates..."
              value={mitigationPlan}
              onChange={(e) => setMitigationPlan(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all border border-violet-400/30"
            >
              {editingRisk ? "Save Changes" : "Create Risk Entry"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

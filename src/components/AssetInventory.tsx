import React, { useState } from "react";
import { 
  Server, 
  Database, 
  HardDrive, 
  Cloud, 
  Building2, 
  PlusCircle, 
  Search, 
  Trash2,
  X 
} from "lucide-react";
import { Asset, AssetType, Criticality } from "../types";

interface AssetInventoryProps {
  assets: Asset[];
  onAddAsset: (asset: Partial<Asset>) => void;
  onDeleteAsset: (assetId: string) => void;
}

export const AssetInventory: React.FC<AssetInventoryProps> = ({
  assets,
  onAddAsset,
  onDeleteAsset,
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New asset form state
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>("CLOUD_INFRA");
  const [criticality, setCriticality] = useState<Criticality>("CRITICAL");
  const [ipAddress, setIpAddress] = useState("");
  const [owner, setOwner] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("AWS us-east-1");

  const getAssetIcon = (assetType: AssetType) => {
    switch (assetType) {
      case "CLOUD_INFRA":
        return <Cloud className="w-4 h-4 text-violet-400" />;
      case "DATA_STORE":
        return <Database className="w-4 h-4 text-emerald-400" />;
      case "HARDWARE":
        return <HardDrive className="w-4 h-4 text-amber-400" />;
      case "SOFTWARE":
        return <Server className="w-4 h-4 text-purple-400" />;
      case "THIRD_PARTY_VENDOR":
        return <Building2 className="w-4 h-4 text-blue-400" />;
      default:
        return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCriticalityBadge = (crit: Criticality) => {
    switch (crit) {
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

  const filteredAssets = assets.filter((asset) => {
    if (selectedTypeFilter !== "ALL" && asset.type !== selectedTypeFilter) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = asset.name.toLowerCase().includes(q);
      const matchOwner = asset.owner.toLowerCase().includes(q);
      const matchDept = asset.department.toLowerCase().includes(q);
      const matchIp = (asset.ipAddress || "").toLowerCase().includes(q);
      if (!matchName && !matchOwner && !matchDept && !matchIp) return false;
    }
    return true;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddAsset({
      id: `ast-${Date.now()}`,
      name,
      type,
      criticality,
      ipAddress,
      owner: owner || "IT Security Lead",
      department,
      location,
      riskCount: 0,
      incidentCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    });

    // Reset
    setName("");
    setIpAddress("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">ASSET VAULT</span>
          <h1 className="text-xl font-extrabold text-white tracking-tight font-mono mt-0.5 flex items-center gap-2">
            <Server className="w-5 h-5 text-violet-400" />
            Enterprise Asset & Vendor Inventory Vault
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Centralized inventory of cloud infrastructure, databases, hardware, microservices, and third-party SaaS vendors.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/30 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Register New Asset
        </button>
      </div>

      {/* Asset Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white">Tracked Enterprise Assets</h2>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-violet-400 border border-slate-700">
              {filteredAssets.length} Assets
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search asset name, IP, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Asset Types</option>
              <option value="CLOUD_INFRA">Cloud Infrastructure</option>
              <option value="DATA_STORE">Database & Storage</option>
              <option value="SOFTWARE">Software & APIs</option>
              <option value="HARDWARE">Hardware Fleet</option>
              <option value="THIRD_PARTY_VENDOR">Third-Party SaaS Vendors</option>
            </select>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {getAssetIcon(asset.type)}
                    </div>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {asset.type.replaceAll("_", " ")}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getCriticalityBadge(asset.criticality)}`}>
                    {asset.criticality}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-tight">{asset.name}</h3>

                {asset.ipAddress && (
                  <p className="text-sm font-mono text-violet-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 inline-block">
                    {asset.ipAddress}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Owner / Team:</span>
                  <strong className="text-slate-200">{asset.owner}</strong>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Location:</span>
                  <strong className="text-slate-300">{asset.location}</strong>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-semibold text-sm">
                      {asset.riskCount} Linked Risks
                    </span>
                    <span className="text-rose-400 font-semibold text-sm">
                      {asset.incidentCount} Incidents
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteAsset(asset.id)}
                    className="p-1.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                Register New Enterprise Asset
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Payment Gateway API Cluster"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssetType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CLOUD_INFRA">Cloud Infrastructure</option>
                    <option value="DATA_STORE">Database / Storage</option>
                    <option value="SOFTWARE">Software / Microservice</option>
                    <option value="HARDWARE">Hardware Device</option>
                    <option value="THIRD_PARTY_VENDOR">Third-Party SaaS Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Business Criticality</label>
                  <select
                    value={criticality}
                    onChange={(e) => setCriticality(e.target.value as Criticality)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">IP Address / Endpoint / Hostname</label>
                <input
                  type="text"
                  placeholder="e.g. 10.0.12.45 or api.payments.internal"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Owner / Team</label>
                  <input
                    type="text"
                    placeholder="e.g. DevOps Lead"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hosting Region / Cloud</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. AWS us-east-1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-violet-600 hover:bg-violet-500 text-white border border-violet-400/30"
                >
                  Save Asset
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

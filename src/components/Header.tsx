import React, { useState, useRef, useEffect } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  FileText, 
  Search, 
  Bell, 
  Globe,
  ChevronDown,
  Check,
  Plus,
  Zap,
  Shield,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import { ViewTab } from "../types";

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewRiskModal: () => void;
  openIncidentsCount: number;
  criticalRisksCount: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  deviceType: string;
  aspectRatio: string;
  isMobile: boolean;
}

interface CountryRule {
  id: string;
  country: string;
  flag: string;
  code: string;
  rulesets: string;
}

const DEFAULT_COUNTRY_RULES: CountryRule[] = [
  { id: "us", country: "United States", flag: "🇺🇸", code: "US-FED", rulesets: "NIST CSF 2.0 • HIPAA • SEC • CCPA" },
  { id: "eu", country: "European Union", flag: "🇪🇺", code: "EU-REG", rulesets: "GDPR • NIS2 • DORA • EU AI Act" },
  { id: "uk", country: "United Kingdom", flag: "🇬🇧", code: "UK-GOV", rulesets: "UK GDPR • Cyber Essentials Plus" },
  { id: "sg", country: "Singapore", flag: "🇸🇬", code: "SG-MAS", rulesets: "MAS TRM • PDPA • CSA CCoP" },
  { id: "in", country: "India", flag: "🇮🇳", code: "IN-CERT", rulesets: "DPDP Act 2023 • CERT-In Directives" },
  { id: "ca", country: "Canada", flag: "🇨🇦", code: "CA-FED", rulesets: "PIPEDA • OSFI B-13 • Bill C-26" },
  { id: "au", country: "Australia", flag: "🇦🇺", code: "AU-APRA", rulesets: "CPS 234 • Privacy Act • SOCI Act" },
  { id: "iso", country: "Global Standard", flag: "🌐", code: "INT-ISO", rulesets: "ISO/IEC 27001:2022 • SOC 2 Type II" },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewRiskModal,
  openIncidentsCount,
  criticalRisksCount,
  isSidebarOpen,
  onToggleSidebar,
  deviceType,
  aspectRatio,
  isMobile,
}) => {
  const [selectedRule, setSelectedRule] = useState<CountryRule>(DEFAULT_COUNTRY_RULES[0]);
  const [countryRulesList, setCountryRulesList] = useState<CountryRule[]>(DEFAULT_COUNTRY_RULES);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [customCountryName, setCustomCountryName] = useState<string>("");
  const [customRules, setCustomRules] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsAddingCustom(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customCountryName.trim();
    const rules = customRules.trim() || "National Security Framework";
    if (name) {
      const newRule: CountryRule = {
        id: `custom-${Date.now()}`,
        country: name,
        flag: "🌐",
        code: `${name.substring(0, 3).toUpperCase()}-REG`,
        rulesets: rules,
      };
      setCountryRulesList((prev) => [...prev, newRule]);
      setSelectedRule(newRule);
      setCustomCountryName("");
      setCustomRules("");
      setIsAddingCustom(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#070A13]/95 backdrop-blur-xl border-b border-violet-900/30 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left branding & Navbar toggle button */}
          <div className="flex items-center gap-3">
            {/* Sidebar Open/Close Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-violet-300 hover:text-violet-200 border border-violet-500/30 hover:border-violet-500/60 transition-all cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.15)] flex items-center justify-center shrink-0"
              title={isSidebarOpen ? "Close Sidebar Navigation" : "Open Sidebar Navigation"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-violet-400" />
              ) : (
                <Menu className="w-4 h-4 text-violet-400" />
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSelectTab("dashboard")}>
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-950 via-slate-900 to-cyan-950 rounded-xl flex items-center justify-center text-violet-400 font-extrabold text-lg shadow-[0_0_20px_rgba(139,92,246,0.35)] border border-violet-500/40 group-hover:border-violet-400 transition-all overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 via-transparent to-cyan-500/20 group-hover:opacity-100 transition-opacity" />
                <Shield className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight font-mono text-gradient-violet">
                  CygrX
                </span>
                {/* Removed badge as explicitly requested by user */}
              </div>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                placeholder="Search threat vectors, ISO controls, NIST CSF..."
                className="w-full bg-slate-900/80 border border-slate-800/90 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/50 shadow-inner transition-all"
              />
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Country & Jurisdiction Rules Selector */}
            <div className="relative hidden xl:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 hover:border-violet-500/40 text-xs text-slate-300 font-mono transition-all cursor-pointer group"
                title="Switch active Country Jurisdiction Ruleset"
              >
                <Globe className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm">{selectedRule.flag}</span>
                <span className="font-medium text-[11px] max-w-[110px] truncate">{selectedRule.country}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isMenuOpen ? "rotate-180 text-violet-400" : ""}`} />
              </button>

              {/* Country Rules Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-violet-900/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 p-2.5 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2 py-1.5 flex items-center justify-between border-b border-slate-800/80 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Jurisdiction Rulesets
                    </span>
                    <span className="text-[9px] text-violet-400 font-bold uppercase">
                      Country Standards
                    </span>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-1 my-1 pr-0.5 custom-scrollbar">
                    {countryRulesList.map((item) => {
                      const isSelected = item.id === selectedRule.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedRule(item);
                            setIsMenuOpen(false);
                            setIsAddingCustom(false);
                          }}
                          className={`w-full flex items-start justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                            isSelected
                              ? "bg-violet-600/20 text-violet-200 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                              : "hover:bg-slate-800/80 text-slate-300 border border-transparent"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm leading-none">{item.flag}</span>
                              <span className="truncate text-[11px] font-bold">{item.country}</span>
                              <span className="text-[9px] text-slate-400 font-mono">({item.code})</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                              {item.rulesets}
                            </p>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Country Jurisdiction Form / Button */}
                  <div className="pt-1.5 mt-1 border-t border-slate-800/80">
                    {isAddingCustom ? (
                      <form onSubmit={handleAddCustomRule} className="space-y-1.5 p-1">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Country / Jurisdiction..."
                          value={customCountryName}
                          onChange={(e) => setCustomCountryName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Rulesets (e.g. Cyber Act • ISO 27001)"
                          value={customRules}
                          onChange={(e) => setCustomRules(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
                        />
                        <div className="flex gap-1">
                          <button
                            type="submit"
                            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-1 text-[10px] font-bold uppercase transition-colors"
                          >
                            Save Ruleset
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingCustom(false)}
                            className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingCustom(true)}
                        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-slate-800 transition-colors text-[11px]"
                      >
                        <Plus className="w-3.5 h-3.5 text-violet-400" />
                        <span>Add Country Jurisdiction</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Incidents Bell Indicator */}
            <button
              onClick={() => onSelectTab("incidents")}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer group shrink-0"
              title="Active Security Incidents"
            >
              <Bell className="w-4 h-4 text-slate-300 group-hover:text-violet-300 transition-colors" />
              {openIncidentsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.8)] font-mono animate-pulse">
                  {openIncidentsCount}
                </span>
              )}
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={() => onSelectTab("ai-advisor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono tracking-tight transition-all border cursor-pointer shrink-0 ${
                currentTab === "ai-advisor"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                  : "bg-slate-900/80 hover:bg-slate-800 text-violet-300 border-violet-500/30 hover:border-violet-500/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden md:inline">AI ADVISOR</span>
            </button>

            {/* New Risk Modal Launcher */}
            <button
              onClick={onOpenNewRiskModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] border border-violet-400/40 transition-all font-mono cursor-pointer shrink-0"
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

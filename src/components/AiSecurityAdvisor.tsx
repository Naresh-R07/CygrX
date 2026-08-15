import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  RotateCcw
} from "lucide-react";
import { ChatMessage, Risk, Control, Asset, Incident } from "../types";

interface AiSecurityAdvisorProps {
  risks: Risk[];
  isoControls: Control[];
  nistControls: Control[];
  assets: Asset[];
  incidents: Incident[];
  activeTargetRisk?: Risk | null;
  onClearTargetRisk?: () => void;
}

function generateLocalRecommendation(risk: Risk, isoControls: Control[], nistControls: Control[]): string {
  const score = risk.riskScore;
  const level = score >= 16 ? "CRITICAL" : score >= 10 ? "HIGH" : score >= 5 ? "MEDIUM" : "LOW";
  const priority = score >= 16 ? "Immediate (24 hours)" : score >= 10 ? "Short-term (7 days)" : "Medium-term (30 days)";

  const matchingIso = isoControls.filter(c =>
    risk.targetFrameworkControls?.some(tf => tf.includes(c.controlId))
  );
  const matchingNist = nistControls.filter(c =>
    risk.targetFrameworkControls?.some(tf => tf.includes(c.controlId))
  );

  const actions = [
    "Conduct detailed technical assessment of the affected asset and scope of exposure",
    "Implement compensating controls to reduce immediate attack surface",
    "Schedule remediation review within the defined priority window",
    "Document findings and update risk register with current status",
  ];

  let rec = `### AI Security Recommendation for "${risk.title}"\n\n`;
  rec += `**Executive Threat Summary:**\n`;
  rec += `${risk.description}\n\n`;
  rec += `**Priority:** ${priority} | **Risk Rating:** ${level} (${score}/25)\n\n`;
  rec += `**Recommended Action Steps:**\n`;
  rec += actions.map(a => `- ${a}`).join("\n") + "\n\n";

  if (matchingIso.length > 0 || matchingNist.length > 0) {
    rec += `**Target Framework Standard Controls:**\n`;
    matchingIso.forEach(c => {
      rec += `- **ISO 27001 ${c.controlId} (${c.title})**: ${c.description}\n`;
    });
    matchingNist.forEach(c => {
      rec += `- **NIST CSF ${c.controlId} (${c.title})**: ${c.description}\n`;
    });
  } else {
    rec += `**Suggested Controls:**\n`;
    rec += `- ISO 27001 A.8.8 Management of technical vulnerabilities\n`;
    rec += `- NIST PR.IP-1 Protection of Info Assets\n`;
  }

  return rec;
}

function generateLocalChatReply(
  prompt: string,
  risks: Risk[],
  isoControls: Control[],
  nistControls: Control[],
  assets: Asset[],
  incidents: Incident[]
): string {
  const openCount = risks.filter(r => r.status === "OPEN").length;
  const critCount = risks.filter(r => r.riskScore >= 16).length;
  const isoScore = Math.round((isoControls.filter(c => c.status === "FULLY_IMPLEMENTED").length / isoControls.length) * 100);
  const nistScore = Math.round((nistControls.filter(c => c.status === "FULLY_IMPLEMENTED").length / nistControls.length) * 100);
  const openIncidents = incidents.filter(i => i.status !== "CLOSED").length;

  const lower = prompt.toLowerCase();

  if (lower.includes("iso") || lower.includes("27001") || lower.includes("compliance") || lower.includes("gap")) {
    return `Based on your current posture:\n- ISO 27001 Readiness: ${isoScore}%\n- ${isoControls.filter(c => c.status !== "FULLY_IMPLEMENTED").length} controls need attention\n\n**Recommended Steps:**\n1. Prioritize PARTIALLY_IMPLEMENTED controls first (quick wins)\n2. Address NOT_IMPLEMENTED controls with formal remediation plans\n3. Schedule internal audit for FULLY_IMPLEMENTED controls\n4. Update Statement of Applicability with current findings\n\nFocus on access control (A.5.15), vulnerability management (A.8.8), and supplier relationships (A.5.19) which show gaps.`;
  }

  if (lower.includes("nist") || lower.includes("csf") || lower.includes("framework")) {
    return `NIST CSF 2.0 Assessment:\n- Maturity Score: ${nistScore}%\n- ${nistControls.filter(c => c.status !== "FULLY_IMPLEMENTED").length} functions need improvement\n\n**Priority Areas:**\n1. Strengthen IDENTIFY function (asset inventory completeness)\n2. Enhance PROTECT function (access control, data security)\n3. Improve DETECT function (continuous monitoring)\n4. Validate RESPOND function (incident response plans)\n5. Test RECOVER function (disaster recovery drills)`;
  }

  if (lower.includes("incident") || lower.includes("breach") || lower.includes("response")) {
    return `Incident Response Guidance:\n- Active incidents: ${openIncidents}\n- Follow NIST SP 800-61r2 incident handling lifecycle\n\n**Immediate Steps:**\n1. CONTAIN: Isolate affected systems, preserve evidence\n2. ERADICATE: Remove root cause, patch vulnerabilities\n3. RECOVER: Restore systems from clean backups\n4. LESSONS LEARNED: Conduct post-incident review within 48 hours\n\nEnsure all actions are documented in the incident tracker.`;
  }

  if (lower.includes("risk") || lower.includes("threat") || lower.includes("scoring")) {
    return `Current Risk Landscape:\n- Total Risks: ${risks.length}\n- Open: ${openCount} | Critical: ${critCount}\n\n**Risk Management Recommendations:**\n1. Address critical risks (score >= 16) immediately\n2. Review under_risk risks for status updates\n3. Validate mitigated risks have effective controls\n4. Consider risk transfer for third-party exposures\n5. Update risk register monthly with latest assessments`;
  }

  return `I'm your AI GRC assistant. Here's your current security snapshot:\n- Open Risks: ${openCount} (${critCount} Critical)\n- ISO 27001: ${isoScore}% | NIST CSF 2.0: ${nistScore}%\n- Assets: ${assets.length} | Active Incidents: ${openIncidents}\n\nAsk me about:\n- ISO 27001 gap analysis or compliance gaps\n- NIST CSF 2.0 framework maturity\n- Incident response procedures\n- Risk scoring and threat assessment\n- Control recommendations`;
}

export const AiSecurityAdvisor: React.FC<AiSecurityAdvisorProps> = ({
  risks,
  isoControls,
  nistControls,
  assets,
  incidents,
  activeTargetRisk,
  onClearTargetRisk,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      role: "assistant",
      content: `Greetings! I am your virtual Senior Cybersecurity Lead Auditor certified in ISO 27001:2022 and NIST CSF 2.0.

I have analyzed your real-time security posture:
- Open Risk Exposure: ${risks.filter(r => r.status === 'OPEN').length} active threats (${risks.filter(r => r.riskScore >= 16).length} Critical)
- ISO 27001 Readiness: ${Math.round((isoControls.filter(c => c.status === 'FULLY_IMPLEMENTED').length / isoControls.length) * 100)}%
- NIST CSF 2.0 Maturity: ${Math.round((nistControls.filter(c => c.status === 'FULLY_IMPLEMENTED').length / nistControls.length) * 100)}%

How can I assist your security and governance team today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRequestRiskRecommendation = useCallback(async (targetRisk: Risk) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: `Analyze risk profile "${targetRisk.title}" (Likelihood: ${targetRisk.likelihood}, Impact: ${targetRisk.impact}, Score: ${targetRisk.riskScore}/25). Recommend ISO 27001 & NIST CSF mitigation controls.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Generate locally
    setTimeout(() => {
      const botContent = generateLocalRecommendation(targetRisk, isoControls, nistControls);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: botContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
      if (onClearTargetRisk) onClearTargetRisk();
    }, 600);
  }, [isoControls, nistControls, onClearTargetRisk]);

  useEffect(() => {
    if (activeTargetRisk) {
      handleRequestRiskRecommendation(activeTargetRisk);
    }
  }, [activeTargetRisk, handleRequestRiskRecommendation]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;

    const userMsgText = inputPrompt;
    setInputPrompt("");

    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    // Generate locally
    setTimeout(() => {
      const reply = generateLocalChatReply(userMsgText, risks, isoControls, nistControls, assets, incidents);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsLoading(false);
    }, 400);
  };

  const presetPrompts = [
    "Generate ISO 27001 Annex A Gap Analysis Plan for our production cloud infra",
    "How to respond to an active Kubernetes pod RCE incident (NIST RS.RP-1)?",
    "Draft Third-Party Vendor Security Risk Assessment questionnaire",
    "Recommend MFA enforcement policy for remote contractors",
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cyber-card p-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-violet-600 text-white border border-violet-400/40">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight font-mono text-gradient-violet">
                AI Cyber Security Lead Auditor & SOC Advisor
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-950/80 text-violet-300 border border-violet-500/40 font-mono">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              Context-aware security governance assistant trained on ISO 27001:2022, NIST CSF 2.0, SOC 2 Type II, and real-time threat modeling.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Chat
        </button>
      </div>

      {/* Preset Prompts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presetPrompts.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputPrompt(promptText);
            }}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left text-xs text-slate-300 hover:text-purple-200 transition-all flex items-start gap-2 group"
          >
            <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
            <span className="line-clamp-2">{promptText}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[60vh] sm:h-[520px] overflow-hidden shadow-2xl">
        
        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isBot ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isBot
                      ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                      : "bg-cyan-600/20 text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isBot
                      ? "bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm"
                      : "bg-cyan-600 text-white shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-xs opacity-70">
                    <span className="font-bold">{isBot ? "AI Auditor" : "You (Security Specialist)"}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                AI is analyzing threat posture and standard controls...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask AI Lead Auditor about ISO 27001, NIST CSF 2.0, threat modeling, or risk scoring..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="px-5 py-3 rounded-xl font-semibold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 transition-all flex items-center gap-2 text-xs"
          >
            <span>Consult</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
};

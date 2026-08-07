import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  FileCheck2, 
  AlertTriangle, 
  Lightbulb, 
  RotateCcw,
  CheckCircle2
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
      content: `Greetings! I am Aegis AI, your virtual Senior Cybersecurity Lead Auditor certified in ISO 27001:2022 and NIST CSF 2.0.

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle active targeted risk consultation
  useEffect(() => {
    if (activeTargetRisk) {
      handleRequestRiskRecommendation(activeTargetRisk);
    }
  }, [activeTargetRisk]);

  const handleRequestRiskRecommendation = async (targetRisk: Risk) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: `Analyze risk profile "${targetRisk.title}" (Likelihood: ${targetRisk.likelihood}, Impact: ${targetRisk.impact}, Score: ${targetRisk.riskScore}/25). Recommend ISO 27001 & NIST CSF mitigation controls.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: targetRisk.title,
          description: targetRisk.description,
          likelihood: targetRisk.likelihood,
          impact: targetRisk.impact,
          assetName: targetRisk.assetName,
          category: targetRisk.category,
        }),
      });

      const data = await res.json();
      let botContent = "";

      if (data.success && data.recommendation) {
        const rec = data.recommendation;
        botContent = `### AI Security Recommendation for "${targetRisk.title}"

**Executive Threat Summary:**
${rec.summary}

**Priority:** ${rec.mitigationPriority} | **Risk Rating:** ${rec.riskLevel}

**Recommended Technical & Administrative Action Steps:**
${rec.suggestedActions?.map((act: string) => `- ${act}`).join("\n")}

**Target Framework Standard Controls:**
${rec.recommendedControls?.map((c: any) => `- **${c.code} (${c.name})**: ${c.description}`).join("\n")}`;
      } else {
        botContent = `Target Risk Analysis for "${targetRisk.title}":
- **Priority:** High
- **ISO 27001 Mapping:** A.8.8 Management of technical vulnerabilities
- **NIST CSF Mapping:** PR.IP-1 Protection of Info Assets
- **Suggested Step:** Apply vendor security patch within 48 hours and restrict ingress access via WAF rules.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: botContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      if (onClearTargetRisk) onClearTargetRisk();
    }
  };

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

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newMsg].map((m) => ({ role: m.role, content: m.content })),
          contextData: {
            riskCount: risks.length,
            isoScore: Math.round((isoControls.filter(c => c.status === 'FULLY_IMPLEMENTED').length / isoControls.length) * 100),
            nistScore: Math.round((nistControls.filter(c => c.status === 'FULLY_IMPLEMENTED').length / nistControls.length) * 100),
            assetCount: assets.length,
            incidentCount: incidents.filter(i => i.status !== 'CLOSED').length,
          },
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.reply || "I have analyzed your query. Here are the recommended control steps.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: "assistant",
          content: "Encountered issue communicating with Gemini server. Please check your GEMINI_API_KEY in Secrets.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] border border-violet-400/40">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight font-mono text-gradient-violet">
                AI Cyber Security Lead Auditor & SOC Advisor
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-950/80 text-violet-300 border border-violet-500/40 font-mono">
                Gemini AI Engine
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-2xl">
        
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
                  className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isBot
                      ? "bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm"
                      : "bg-cyan-600 text-white shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70">
                    <span className="font-bold">{isBot ? "Aegis AI Auditor" : "You (Security Specialist)"}</span>
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
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                Gemini is analyzing threat posture and standard controls...
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
            className="px-5 py-3 rounded-xl font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50 disabled:opacity-50 transition-all flex items-center gap-2 text-xs"
          >
            <span>Consult</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
};

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI SDK safely (lazy check per request)
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Recommendation for Risk / Compliance Gap
  app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { title, description, likelihood, impact, assetName, assetType, framework, controlId } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured in environment.",
        });
      }

      const ai = getAiClient();

      const prompt = `You are an enterprise ISO 27001:2022 and NIST CSF 2.0 Lead Security Auditor & Threat Modeling Expert.
Analyze the following security risk/control context and provide structured JSON guidance:

Target Context:
- Risk/Control Title: ${title || controlId || "Security Risk"}
- Description: ${description || "N/A"}
- Severity Matrix: Likelihood=${likelihood || 3}/5, Impact=${impact || 3}/5
- Affected Asset: ${assetName || "General System"} (${assetType || "Infrastructure"})
- Target Framework: ${framework || "ISO 27001:2022 / NIST CSF 2.0"}

Please analyze and return a strictly formatted JSON object with the following fields:
{
  "summary": "Brief executive threat analysis summary (1-2 sentences)",
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "suggestedActions": [
    "Technical control implementation step 1",
    "Administrative or policy control step 2",
    "Monitoring or verification step 3"
  ],
  "recommendedControls": [
    {"code": "ISO 27001 A.8.8", "name": "Management of technical vulnerabilities", "description": "Ensure timely patching and vulnerability scans."},
    {"code": "NIST PR.AC-1", "name": "Access Control Policy", "description": "Enforce strict MFA and RBAC."}
  ],
  "mitigationPriority": "Immediate (24 hours)" | "Short-term (7 days)" | "Medium-term (30 days)"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = {
          summary: responseText,
          riskLevel: (likelihood * impact) >= 16 ? "CRITICAL" : (likelihood * impact) >= 9 ? "HIGH" : "MEDIUM",
          suggestedActions: ["Implement automated scanning", "Restrict administrative access", "Enable continuous audit logging"],
          recommendedControls: [{ code: "ISO 27001 A.5.15", name: "Access Control", description: "Enforce principle of least privilege" }],
          mitigationPriority: "Short-term (7 days)"
        };
      }

      return res.json({ success: true, recommendation: parsed });
    } catch (err: any) {
      console.error("AI Recommendation Error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate AI recommendation" });
    }
  });

  // AI GRC Advisor Chat Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, contextData } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing. Please set your Gemini API key in Secrets.",
        });
      }

      const ai = getAiClient();

      const systemInstruction = `You are Aegis AI, an expert Senior Cybersecurity Risk Officer & GRC Specialist certified in ISO 27001:2022, NIST CSF 2.0, SOC 2 Type II, HIPAA, and GDPR.
You assist cybersecurity teams, CISOs, and compliance auditors with threat modeling, risk evaluation, audit evidence preparation, asset classification, and regulatory alignment.

Current Organization Security Snapshot:
- Total Open Risks: ${contextData?.riskCount ?? "N/A"}
- ISO 27001 Readiness: ${contextData?.isoScore ?? "78"}%
- NIST CSF 2.0 Maturity: ${contextData?.nistScore ?? "82"}%
- Critical Assets Tracked: ${contextData?.assetCount ?? "N/A"}
- Active Incidents: ${contextData?.incidentCount ?? "0"}

Provide authoritative, concise, actionable advice with bullet points and standard control references where appropriate. Keep responses clear and professional.`;

      // Build conversation formatted prompt
      const conversationPrompt = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      const fullPrompt = `${systemInstruction}\n\n${conversationPrompt}\n\nASSISTANT:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: fullPrompt,
        config: {
          temperature: 0.4,
        },
      });

      return res.json({
        success: true,
        reply: response.text || "I am analyzing your query. Please refine or retry.",
      });
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      return res.status(500).json({ error: err.message || "Error processing chat request" });
    }
  });

  // Executive Report Data API
  app.post("/api/pdf/report", (req, res) => {
    const { orgName, risks, assets, compliance, incidents } = req.body;
    const reportData = {
      title: `Executive Cybersecurity GRC Audit Briefing`,
      organization: orgName || "Enterprise Corp",
      generatedAt: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      summary: {
        totalRisks: risks?.length || 0,
        criticalRisks: risks?.filter((r: any) => r.riskScore >= 16).length || 0,
        isoCompliance: compliance?.isoScore || 82,
        nistCompliance: compliance?.nistScore || 78,
        assetCount: assets?.length || 0,
        openIncidents: incidents?.filter((i: any) => i.status !== "CLOSED").length || 0,
      },
      exportStatus: "SUCCESS",
    };
    res.json(reportData);
  });

  // Real-time Server-Sent Events (SSE) Monitoring Endpoint for Live Security Telemetry
  app.get("/api/stream/telemetry", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: "INIT", message: "Real-time GRC stream connected", timestamp: new Date().toISOString() })}\n\n`);

    // Stream live simulated security telemetry pulses every 5 seconds
    const interval = setInterval(() => {
      const events = [
        { type: "METRIC_UPDATE", isoReadiness: 80, activeThreats: 2, status: "SYSTEM_OK" },
        { type: "VULN_SCAN", target: "Kubernetes Cluster EKS-Prod-01", result: "CVE-2026-1940 detected", severity: "HIGH" },
        { type: "COMPLIANCE_CHECK", control: "ISO 27001 A.8.8", status: "VERIFIED" },
        { type: "LOG_EVENT", log: "Okta MFA verification pass rate: 99.8%", level: "INFO" }
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      res.write(`data: ${JSON.stringify({ ...randomEvent, timestamp: new Date().toISOString() })}\n\n`);
    }, 5000);

    req.on("close", () => {
      clearInterval(interval);
      res.end();
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import http from "http";
import { createServer as createViteServer } from "vite";
import { initDatabase } from "./server/db/seed.js";

import authRoutes from "./server/routes/auth.js";
import riskRoutes from "./server/routes/risks.js";
import assetRoutes from "./server/routes/assets.js";
import controlRoutes from "./server/routes/controls.js";
import evidenceRoutes from "./server/routes/evidence.js";
import incidentRoutes from "./server/routes/incidents.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  console.log("[DB] Initializing database...");
  initDatabase();

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // CRUD API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/risks", riskRoutes);
  app.use("/api/assets", assetRoutes);
  app.use("/api/controls", controlRoutes);
  app.use("/api/evidence", evidenceRoutes);
  app.use("/api/incidents", incidentRoutes);

  // Executive Report Data API
  app.post("/api/pdf/report", (req, res) => {
    const { orgName, risks, assets, compliance, incidents } = req.body;
    const reportData = {
      title: "Executive Cybersecurity GRC Audit Briefing",
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

  // Vite middleware setup
  const server = http.createServer(app);

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

  // Initialize WebSocket
  const { initWebSocket } = await import("./server/ws/handler.js");
  initWebSocket(server);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] CygrX SOC running on http://localhost:${PORT}`);
    console.log(`[SERVER] WebSocket available at ws://localhost:${PORT}/ws`);
    console.log(`[SERVER] API routes: /api/auth, /api/risks, /api/assets, /api/controls, /api/evidence, /api/incidents`);
  });
}

startServer();

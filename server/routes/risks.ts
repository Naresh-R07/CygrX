import { Router } from "express";
import { getDb } from "../db/connection.js";
import { AuthRequest, authenticateToken, requireRole } from "../middleware/auth.js";
import { broadcast } from "../ws/handler.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", authenticateToken, (req: AuthRequest, res) => {
  const db = getDb();
  const { status, level } = req.query;

  let sql = "SELECT * FROM risks";
  const conditions: string[] = [];
  const params: any[] = [];

  if (status && status !== "ALL") {
    conditions.push("status = ?");
    params.push(status);
  }
  if (level && level !== "ALL") {
    conditions.push("risk_level = ?");
    params.push(level);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY risk_score DESC, created_at DESC";

  const risks = db.prepare(sql).all(...params).map((r: any) => ({
    ...r,
    targetFrameworkControls: JSON.parse(r.target_framework_controls || "[]"),
  }));

  res.json({ risks });
});

router.get("/:id", authenticateToken, (req, res) => {
  const db = getDb();
  const risk = db.prepare("SELECT * FROM risks WHERE id = ?").get(req.params.id) as any;
  if (!risk) {
    res.status(404).json({ error: "Risk not found" });
    return;
  }
  res.json({ risk: { ...risk, targetFrameworkControls: JSON.parse(risk.target_framework_controls || "[]") } });
});

router.post("/", authenticateToken, requireRole("ADMIN", "AUDITOR"), (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const id = `rsk-${uuidv4().slice(0, 8)}`;
    const { title, description, likelihood, impact, category, mitigationPlan, assetId, assetName, assignee, targetFrameworkControls, status } = req.body;

    const score = (likelihood || 3) * (impact || 3);
    let level = "LOW";
    if (score >= 16) level = "CRITICAL";
    else if (score >= 10) level = "HIGH";
    else if (score >= 5) level = "MEDIUM";

    db.prepare(`
      INSERT INTO risks (id, title, description, likelihood, impact, risk_score, risk_level, category, mitigation_plan, asset_id, asset_name, assignee, target_framework_controls, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title || "Untitled Risk", description || "", likelihood || 3, impact || 3, score, level, category || "Technical", mitigationPlan || "", assetId || "", assetName || "", assignee || "SecOps Team", JSON.stringify(targetFrameworkControls || []), status || "OPEN");

    const risk = db.prepare("SELECT * FROM risks WHERE id = ?").get(id) as any;
    res.status(201).json({ risk: { ...risk, targetFrameworkControls: JSON.parse(risk.target_framework_controls || "[]") } });
    broadcast({ type: "created", entity: "risk" });
  } catch (err: any) {
    console.error("Create risk error:", err);
    res.status(500).json({ error: "Failed to create risk" });
  }
});

router.put("/:id", authenticateToken, requireRole("ADMIN", "AUDITOR"), (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM risks WHERE id = ?").get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: "Risk not found" });
      return;
    }

    const { title, description, likelihood, impact, category, mitigationPlan, assetId, assetName, assignee, targetFrameworkControls, status } = req.body;

    const newLikelihood = likelihood ?? existing.likelihood;
    const newImpact = impact ?? existing.impact;
    const score = newLikelihood * newImpact;
    let level = "LOW";
    if (score >= 16) level = "CRITICAL";
    else if (score >= 10) level = "HIGH";
    else if (score >= 5) level = "MEDIUM";

    db.prepare(`
      UPDATE risks SET title=?, description=?, likelihood=?, impact=?, risk_score=?, risk_level=?, category=?, mitigation_plan=?, asset_id=?, asset_name=?, assignee=?, target_framework_controls=?, status=?, updated_at=datetime('now')
      WHERE id=?
    `).run(
      title ?? existing.title, description ?? existing.description, newLikelihood, newImpact, score, level,
      category ?? existing.category, mitigationPlan ?? existing.mitigation_plan,
      assetId ?? existing.asset_id, assetName ?? existing.asset_name, assignee ?? existing.assignee,
      JSON.stringify(targetFrameworkControls ?? JSON.parse(existing.target_framework_controls || "[]")),
      status ?? existing.status, req.params.id
    );

    const risk = db.prepare("SELECT * FROM risks WHERE id = ?").get(req.params.id) as any;
    res.json({ risk: { ...risk, targetFrameworkControls: JSON.parse(risk.target_framework_controls || "[]") } });
    broadcast({ type: "updated", entity: "risk" });
  } catch (err: any) {
    console.error("Update risk error:", err);
    res.status(500).json({ error: "Failed to update risk" });
  }
});

router.delete("/:id", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM risks WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Risk not found" });
    return;
  }
  res.json({ success: true });
  broadcast({ type: "deleted", entity: "risk" });
});

export default router;

import { Router } from "express";
import { getDb } from "../db/connection.js";
import { AuthRequest, authenticateToken, requireRole } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const db = getDb();
  const { severity, status } = req.query;

  let sql = "SELECT * FROM incidents";
  const conditions: string[] = [];
  const params: any[] = [];

  if (severity && severity !== "ALL") {
    conditions.push("severity = ?");
    params.push(severity);
  }
  if (status && status !== "ALL") {
    conditions.push("status = ?");
    params.push(status);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY reported_at DESC";

  const incidents = db.prepare(sql).all(...params).map((i: any) => ({
    ...i,
    actionItems: JSON.parse(i.action_items || "[]"),
  }));

  res.json({ incidents });
});

router.get("/:id", authenticateToken, (req, res) => {
  const db = getDb();
  const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(req.params.id) as any;
  if (!incident) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }
  res.json({ incident: { ...incident, actionItems: JSON.parse(incident.action_items || "[]") } });
});

router.post("/", authenticateToken, requireRole("ADMIN", "AUDITOR"), (req, res) => {
  try {
    const db = getDb();
    const id = `inc-${uuidv4().slice(0, 8)}`;
    const { title, description, severity, assetId, assetName, reporter, rootCause, actionItems } = req.body;

    db.prepare(`
      INSERT INTO incidents (id, title, description, severity, status, asset_id, asset_name, reporter, reported_at, root_cause, action_items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)
    `).run(id, title || "Security Alert", description || "", severity || "HIGH", "NEW", assetId || "", assetName || "", reporter || "SOC", rootCause || "", JSON.stringify(actionItems || []));

    const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(id) as any;
    res.status(201).json({ incident: { ...incident, actionItems: JSON.parse(incident.action_items || "[]") } });
  } catch (err: any) {
    console.error("Create incident error:", err);
    res.status(500).json({ error: "Failed to create incident" });
  }
});

router.put("/:id", authenticateToken, requireRole("ADMIN", "AUDITOR"), (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM incidents WHERE id = ?").get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: "Incident not found" });
      return;
    }

    const { title, description, severity, status, assetId, assetName, reporter, rootCause, actionItems } = req.body;

    const newStatus = status ?? existing.status;
    const resolvedAt = newStatus === "CLOSED" ? new Date().toISOString() : existing.resolved_at;

    db.prepare(`
      UPDATE incidents SET title=?, description=?, severity=?, status=?, asset_id=?, asset_name=?, reporter=?, root_cause=?, action_items=?, resolved_at=?
      WHERE id=?
    `).run(
      title ?? existing.title, description ?? existing.description, severity ?? existing.severity,
      newStatus, assetId ?? existing.asset_id, assetName ?? existing.asset_name,
      reporter ?? existing.reporter, rootCause ?? existing.root_cause,
      JSON.stringify(actionItems ?? JSON.parse(existing.action_items || "[]")),
      resolvedAt, req.params.id
    );

    const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(req.params.id) as any;
    res.json({ incident: { ...incident, actionItems: JSON.parse(incident.action_items || "[]") } });
  } catch (err: any) {
    console.error("Update incident error:", err);
    res.status(500).json({ error: "Failed to update incident" });
  }
});

router.delete("/:id", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM incidents WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Incident not found" });
    return;
  }
  res.json({ success: true });
});

export default router;

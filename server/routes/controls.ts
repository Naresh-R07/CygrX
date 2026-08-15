import { Router } from "express";
import { getDb } from "../db/connection.js";
import { AuthRequest, authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const db = getDb();
  const { framework } = req.query;

  let sql = "SELECT * FROM controls";
  if (framework) {
    sql += " WHERE framework = ?";
  }
  sql += " ORDER BY control_id ASC";

  const controls = framework
    ? db.prepare(sql).all(framework).map((c: any) => ({ ...c, evidenceIds: JSON.parse(c.evidence_ids || "[]") }))
    : db.prepare(sql).all().map((c: any) => ({ ...c, evidenceIds: JSON.parse(c.evidence_ids || "[]") }));

  res.json({ controls });
});

router.get("/:id", authenticateToken, (req, res) => {
  const db = getDb();
  const control = db.prepare("SELECT * FROM controls WHERE id = ?").get(req.params.id) as any;
  if (!control) {
    res.status(404).json({ error: "Control not found" });
    return;
  }
  res.json({ control: { ...control, evidenceIds: JSON.parse(control.evidence_ids || "[]") } });
});

router.put("/:id", authenticateToken, requireRole("ADMIN", "AUDITOR"), (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM controls WHERE id = ?").get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: "Control not found" });
      return;
    }

    const { status, notes, evidenceIds } = req.body;

    db.prepare(`
      UPDATE controls SET status=?, notes=?, evidence_ids=?, updated_at=datetime('now')
      WHERE id=?
    `).run(status ?? existing.status, notes ?? existing.notes, JSON.stringify(evidenceIds ?? JSON.parse(existing.evidence_ids || "[]")), req.params.id);

    const control = db.prepare("SELECT * FROM controls WHERE id = ?").get(req.params.id) as any;
    res.json({ control: { ...control, evidenceIds: JSON.parse(control.evidence_ids || "[]") } });
  } catch (err: any) {
    console.error("Update control error:", err);
    res.status(500).json({ error: "Failed to update control" });
  }
});

export default router;

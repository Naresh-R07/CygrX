import { Router } from "express";
import { getDb } from "../db/connection.js";
import { AuthRequest, authenticateToken, requireRole } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const db = getDb();
  const { type } = req.query;

  let sql = "SELECT * FROM assets";
  if (type && type !== "ALL") {
    sql += " WHERE type = ?";
  }
  sql += " ORDER BY created_at DESC";

  const assets = type && type !== "ALL"
    ? db.prepare(sql).all(type)
    : db.prepare(sql).all();

  res.json({ assets });
});

router.get("/:id", authenticateToken, (req, res) => {
  const db = getDb();
  const asset = db.prepare("SELECT * FROM assets WHERE id = ?").get(req.params.id);
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  res.json({ asset });
});

router.post("/", authenticateToken, requireRole("ADMIN", "AUDITOR"), (req, res) => {
  try {
    const db = getDb();
    const id = `ast-${uuidv4().slice(0, 8)}`;
    const { name, type, criticality, ipAddress, owner, department, location } = req.body;

    db.prepare(`
      INSERT INTO assets (id, name, type, criticality, ip_address, owner, department, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name || "New Asset", type || "CLOUD_INFRA", criticality || "MEDIUM", ipAddress || "", owner || "IT Ops", department || "Engineering", location || "Cloud");

    const asset = db.prepare("SELECT * FROM assets WHERE id = ?").get(id);
    res.status(201).json({ asset });
  } catch (err: any) {
    console.error("Create asset error:", err);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

router.put("/:id", authenticateToken, requireRole("ADMIN", "AUDITOR"), (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare("SELECT * FROM assets WHERE id = ?").get(req.params.id) as any;
    if (!existing) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    const { name, type, criticality, ipAddress, owner, department, location } = req.body;

    db.prepare(`
      UPDATE assets SET name=?, type=?, criticality=?, ip_address=?, owner=?, department=?, location=?
      WHERE id=?
    `).run(name ?? existing.name, type ?? existing.type, criticality ?? existing.criticality, ipAddress ?? existing.ip_address, owner ?? existing.owner, department ?? existing.department, location ?? existing.location, req.params.id);

    const asset = db.prepare("SELECT * FROM assets WHERE id = ?").get(req.params.id);
    res.json({ asset });
  } catch (err: any) {
    console.error("Update asset error:", err);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

router.delete("/:id", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const result = db.prepare("DELETE FROM assets WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  res.json({ success: true });
});

export default router;

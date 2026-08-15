import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getDb } from "../db/connection.js";
import { AuthRequest, authenticateToken, requireRole } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = uuidv4().slice(0, 8);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".csv", ".png", ".jpg", ".jpeg", ".json", ".txt", ".docx", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

const router = Router();

router.get("/", authenticateToken, (req, res) => {
  const db = getDb();
  const evidences = db.prepare("SELECT * FROM evidence ORDER BY uploaded_at DESC").all().map((e: any) => ({
    ...e,
    linkedControlIds: JSON.parse(e.linked_control_ids || "[]"),
  }));
  res.json({ evidences });
});

router.get("/:id", authenticateToken, (req, res) => {
  const db = getDb();
  const evidence = db.prepare("SELECT * FROM evidence WHERE id = ?").get(req.params.id) as any;
  if (!evidence) {
    res.status(404).json({ error: "Evidence not found" });
    return;
  }
  res.json({ evidence: { ...evidence, linkedControlIds: JSON.parse(evidence.linked_control_ids || "[]") } });
});

router.post("/", authenticateToken, requireRole("ADMIN", "AUDITOR"), upload.single("file"), (req: AuthRequest, res) => {
  try {
    const db = getDb();
    const id = `ev-${uuidv4().slice(0, 8)}`;
    const { title, uploadedBy, linkedControlIds, notes } = req.body;

    const file = req.file;
    const fileName = file?.originalname || "unknown";
    const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "0 MB";
    const fileType = file?.mimetype || "application/octet-stream";
    const filePath = file?.filename || "";

    db.prepare(`
      INSERT INTO evidence (id, title, file_name, file_size, file_type, uploaded_by, linked_control_ids, notes, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title || fileName, fileName, fileSize, fileType, uploadedBy || "System", linkedControlIds || "[]", notes || "", filePath);

    const evidence = db.prepare("SELECT * FROM evidence WHERE id = ?").get(id) as any;
    res.status(201).json({ evidence: { ...evidence, linkedControlIds: JSON.parse(evidence.linked_control_ids || "[]") } });
  } catch (err: any) {
    console.error("Create evidence error:", err);
    res.status(500).json({ error: "Failed to upload evidence" });
  }
});

router.get("/:id/download", authenticateToken, (req, res) => {
  const db = getDb();
  const evidence = db.prepare("SELECT * FROM evidence WHERE id = ?").get(req.params.id) as any;
  if (!evidence || !evidence.file_path) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  const filePath = path.join(UPLOAD_DIR, evidence.file_path);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found on disk" });
    return;
  }

  res.download(filePath, evidence.file_name);
});

router.delete("/:id", authenticateToken, requireRole("ADMIN"), (req, res) => {
  const db = getDb();
  const evidence = db.prepare("SELECT file_path FROM evidence WHERE id = ?").get(req.params.id) as any;

  if (evidence?.file_path) {
    const filePath = path.join(UPLOAD_DIR, evidence.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  const result = db.prepare("DELETE FROM evidence WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Evidence not found" });
    return;
  }
  res.json({ success: true });
});

export default router;

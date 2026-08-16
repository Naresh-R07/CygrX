import { Router, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDb } from "../db/connection.js";
import { signToken, signRefreshToken, AuthRequest, authenticateToken } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const id = `usr-${uuidv4().slice(0, 8)}`;
    const userRole = role === "ADMIN" || role === "AUDITOR" ? role : "VIEWER";

    db.prepare("INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)")
      .run(id, email, hash, name, userRole);

    const user = { id, email, name, role: userRole as "ADMIN" | "AUDITOR" | "VIEWER" };
    const accessToken = signToken(user);
    const refreshToken = signRefreshToken(user);

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const db = getDb();
    const row = db.prepare("SELECT id, email, password_hash, name, role FROM users WHERE email = ?").get(email) as any;

    if (!row) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = { id: row.id, email: row.email, name: row.name, role: row.role };
    const accessToken = signToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({ user, accessToken, refreshToken });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/refresh", (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token required" });
      return;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      res.status(500).json({ error: "Server configuration error" });
      return;
    }
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;

    if (decoded.type !== "refresh") {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    const user = { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role };
    const newAccessToken = signToken(user);

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
});

router.get("/me", authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: req.user });
});

export default router;

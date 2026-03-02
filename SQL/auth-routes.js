import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

export const authRouter = express.Router();

function signToken(userId, username) {
  return jwt.sign(
    { sub: userId, username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

// REGISTER: store username + hashed password
authRouter.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "username and password are required" });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username, created_at;`,
      [username, passwordHash]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "username already exists" });
    res.status(500).json({ error: err.message });
  }
});

// LOGIN: verify password and return token
authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "username and password are required" });

    const result = await pool.query(
      `SELECT id, username, password_hash FROM users WHERE username = $1;`,
      [username]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user.id, user.username);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
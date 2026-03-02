import dotenv from "dotenv";
import express from "express";
import { pool } from "./db.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const app = express();
app.use(express.json());

/**
 * CREATE: Add a new student
 * POST /students
 * body: { "username": "john", "password": "1234" }
 */
app.post("/students", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username and password are required" });

    const result = await pool.query(
      `INSERT INTO students (username, password_hash)
       VALUES ($1, $2)
       RETURNING id, username, created_at;`,
      [username, password] // replace with real password hashing in production
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "username already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * READ ALL: Get all students
 * GET /students
 */
app.get("/students", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, created_at FROM users ORDER BY id DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * READ ONE: Get a student by ID
 * GET /students/:id
 */
app.get("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, username, created_at FROM users WHERE id = $1;`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE: Update a student's username
 * PUT /students/:id
 * body: { "username": "Sam" }
 */
app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "username is required" });

    const result = await pool.query(
      `UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, created_at;`,
      [username, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE: Remove a student
 * DELETE /students/:id
 */
app.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username;`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Deleted successfully", student: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`✅ SQL server running on http://localhost:${PORT}`));
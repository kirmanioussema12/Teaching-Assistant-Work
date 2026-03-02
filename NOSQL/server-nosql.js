import dotenv from "dotenv";
import express from "express";
import { connectMongo } from "./db.js";
import { User } from "./user.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const app = express();
app.use(express.json());

/**
 * STORE: Create a new user
 * POST /users
 */
app.post("/users", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "username is required" });

    const user = await User.create({ username, passwordHash: "TEMP_HASH" });

    res.status(201).json({
      id: user._id,
      username: user.username,
      createdAt: user.createdAt,
    });
  } catch (err) {
    // duplicate key error in Mongo
    if (err.code === 11000) {
      return res.status(409).json({ error: "username already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * RETRIEVE ONE: Get a user by username
 * GET /users/:username
 */
app.get("/users/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select("username createdAt");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ id: user._id, username: user.username, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * RETRIEVE ALL: List all users
 * GET /users
 */
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("username createdAt").sort({ createdAt: -1 });
    res.json(users.map(u => ({ id: u._id, username: u.username, createdAt: u.createdAt })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3002;

async function start() {
  await connectMongo();
  app.listen(PORT, () => console.log(`✅ NoSQL server running on http://localhost:${PORT}`));
}

start().catch(err => console.error("❌ Mongo start failed:", err.message));
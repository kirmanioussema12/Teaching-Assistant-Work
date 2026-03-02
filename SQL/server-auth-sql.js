import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { authRouter } from "./auth-routes.js";
import { requireAuth } from "./requireAuth.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);

app.get("/me", requireAuth, (req, res) => {
  res.json({ userId: req.user.sub, username: req.user.username });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`✅ Auth SQL server running on http://localhost:${PORT}`));
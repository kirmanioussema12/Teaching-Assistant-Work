import dotenv from "dotenv";
import express from "express";

dotenv.config(); // loads .env file

const app = express();

app.use(express.json()); // allows us to read JSON from requests

// Simple test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
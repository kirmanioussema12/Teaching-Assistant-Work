import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Connected successfully:", result.rows[0]);
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

testConnection();
import dotenv from "dotenv";
import pg from "pg";

// Load the .env from the project root (works even when running from /SQL)
dotenv.config({ path: new URL("../.env", import.meta.url) });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function main() {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("✅ Tables in DB:", result.rows.map((r) => r.table_name));
  } catch (err) {
    console.error("❌ Check failed:", err.message);
  } finally {
    await pool.end();
  }
}

main();
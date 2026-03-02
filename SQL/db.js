import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: new URL("../.env", import.meta.url) });

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("[PG] DATABASE_URL not found in environment");
}

export const pool = new Pool({ connectionString });

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

export async function checkConnection() {
  try {
    const res = await query("SELECT 1 as ok");
    return res && res.rows && res.rows[0] && res.rows[0].ok === 1;
  } catch (err) {
    console.error("[PG] health check failed:", err);
    return false;
  }
}

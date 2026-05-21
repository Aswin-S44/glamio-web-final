import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Prefer PROD URL when available, fall back to LOCAL for development
const dbUrl = process.env.DATABASE_URL_PROD || process.env.DATABASE_URL_LOCAL;
const isRemote = dbUrl === process.env.DATABASE_URL_PROD;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool);

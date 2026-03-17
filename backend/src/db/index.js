import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const dbUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DATABASE_URL_LOCAL
    : process.env.FRONTEND_URL_PROD;

const pool = new Pool({
  connectionString: dbUrl,
});

export const db = drizzle(pool);

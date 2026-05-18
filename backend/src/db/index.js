import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const dbUrl = isProduction
  ? process.env.DATABASE_URL_PROD
  : process.env.DATABASE_URL_LOCAL;

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

// Test DB connection
pool
  .connect()
  .then((client) => {
    console.log("✅ PostgreSQL connected successfully");

    client.release(); // release the client back to pool
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed");
    console.error(err);
  });

export const db = drizzle(pool);

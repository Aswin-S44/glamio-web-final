import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const dbUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DATABASE_URL_LOCAL
    : process.env.DATABASE_URL_PROD;

console.log("dbUrl--------------", dbUrl);

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  family: 4,
});

pool
  .connect()
  .then((client) => {
    console.log("✅ PostgreSQL connected successfully");

    client.release();
  })
  .catch((err) => {
    console.log("❌ PostgreSQL connection failed");
    console.log(err);
  });

export const db = drizzle(pool);

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// const dbUrl =
//   "postgresql://postgres:8979UOIDS23829382932932IKKKKKKKKKKKKK;;;IIII<<<kOOPO@db.ozvloioxtygihqyspslp.supabase.co:5432/postgres";

const dbUrl ="postgresql://postgres.ozvloioxtygihqyspslp:8908jkdsjkdjskdjskdjkhuyui,,.kodiosdsdisodisoid@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  family: 4,
});

console.log("dbUrl*****************", dbUrl);

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

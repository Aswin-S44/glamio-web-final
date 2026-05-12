// import { drizzle } from "drizzle-orm/node-postgres";
// import pg from "pg";
// import dotenv from "dotenv";

// dotenv.config();

// const { Pool } = pg;

// // const dbUrl =
// //   process.env.NODE_ENV === "development"
// //     ? process.env.DATABASE_URL_LOCAL
// //     : process.env.DATABASE_URL_PROD;

// const dbUrl =
//   "postgresql://postgres:&ZFC7-7nC%7m8VZ@db.ozvloioxtygihqyspslp.supabase.co:5432/postgres";

// const pool = new Pool({
//   connectionString: dbUrl,
// });

// export const db = drizzle(pool);

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// 1. Use the Connection Pooler URL from Supabase Dashboard (Port 6543)
// 2. IMPORTANT: If your password has special characters, ensure the URL is encoded
// 3. IMPORTANT: Add ?sslmode=require to the string OR set ssl in the config
const dbUrl =
  "postgresql://postgres:&ZFC7-7nC%7m8VZ@db.ozvloioxtygihqyspslp.supabase.co:6543/postgres";

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase/Render
  },
});

export const db = drizzle(pool);

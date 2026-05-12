import { defineConfig } from "drizzle-kit";
import "dotenv/config";

// const dbUrl =
//   process.env.NODE_ENV === "development"
//     ? process.env.DATABASE_URL_LOCAL
//     : process.env.DATABASE_URL_PROD;

const dbUrl =
  "postgresql://postgres:8979UOIDS23829382932932IKKKKKKKKKKKKK;;;IIII<<<kOOPO@db.ozvloioxtygihqyspslp.supabase.co:5432/postgres";

export default defineConfig({
  schema: "./src/db/schemas",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});

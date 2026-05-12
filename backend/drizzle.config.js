import { defineConfig } from "drizzle-kit";
import "dotenv/config";

// const dbUrl =
//   process.env.NODE_ENV === "development"
//     ? process.env.DATABASE_URL_LOCAL
//     : process.env.DATABASE_URL_PROD;

const dbUrl =
  "postgresql://postgres:&ZFC7-7nC%7m8VZ@db.ozvloioxtygihqyspslp.supabase.co:5432/postgres";

export default defineConfig({
  schema: "./src/db/schemas",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});

import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const dbUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DATABASE_URL_LOCAL
    : process.env.FRONTEND_URL_PROD;

export default defineConfig({
  schema: "./src/db/schemas",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});

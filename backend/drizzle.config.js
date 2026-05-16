import { defineConfig } from "drizzle-kit";
import "dotenv/config";

const dbUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL_PROD
    : process.env.DATABASE_URL_LOCAL;

export default defineConfig({
  schema: "./src/db/schemas",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "mysql",
  schema: "./src/drizzle/schemas/index.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
});

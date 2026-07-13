import { mysqlTable } from "drizzle-orm/mysql-core";
import { id, updatedAt } from "../utils";

export const QuotaTable = mysqlTable("quota", (table) => ({
  id,
  storiesUsed: table.smallint().notNull(),
  imagesUsed: table.smallint().notNull(),
  // voiceCharsUsed: table.int().notNull(),
  resetAt: table.timestamp().notNull().defaultNow(),
  updatedAt,
}));

export type QuotaInsertForm = typeof QuotaTable.$inferInsert;

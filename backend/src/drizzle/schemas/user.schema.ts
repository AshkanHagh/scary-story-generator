import { relations } from "drizzle-orm";
import { StoryTable } from "./story.schema";
import { createdAt, id, updatedAt } from "../utils";
import { mysqlTable } from "drizzle-orm/mysql-core";

export const UserTable = mysqlTable("users", (table) => {
  return {
    id,
    isAnonymous: table.boolean().notNull().default(false),
    token: table.text(),
    createdAt,
    updatedAt,
  };
});

export type User = typeof UserTable.$inferSelect;

export const UserRelation = relations(UserTable, ({ many }) => ({
  stories: many(StoryTable),
}));

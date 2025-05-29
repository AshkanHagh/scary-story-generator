import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { StoryTable } from "./story.schema";

export const UserTable = pgTable("users", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    isAnonymous: table.boolean().notNull().default(false),
    token: table.text(),
    createdAt: table.timestamp().notNull().defaultNow(),
    updatedAt: table
      .timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
});

export const UserRelation = relations(UserTable, ({ many }) => ({
  stories: many(StoryTable),
}));

export type IUser = typeof UserTable.$inferSelect;
export type IUserInsertForm = typeof UserTable.$inferInsert;

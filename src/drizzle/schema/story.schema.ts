import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { SegmentTable } from "./segment.schema";

export const StoryStatusEnum = pgEnum("story_status_enum", [
  "processing",
  "completed",
  "failed",
]);

export const StoryTable = pgTable("stories", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id),
    title: table.varchar({ length: 128 }).notNull(),
    script: table.varchar({ length: 10_000 }).notNull(),
    status: StoryStatusEnum().default("processing"),
    createdAt: table.timestamp().notNull().defaultNow(),
    updatedAt: table
      .timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
});

export const StoryRelation = relations(StoryTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [StoryTable.userId],
    references: [UserTable.id],
  }),
  segments: many(SegmentTable),
}));

export type IStory = typeof StoryTable.$inferSelect;
export type IStoryInsertForm = typeof StoryTable.$inferInsert;

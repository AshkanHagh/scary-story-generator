import { pgTable } from "drizzle-orm/pg-core";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { ISegment, SegmentTable } from "./segment.schema";

export const StoryTable = pgTable("stories", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    title: table.varchar({ length: 128 }).notNull(),
    script: table.varchar({ length: 10_000 }).notNull(),
    context: table.text(),
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
export type IStoryView = IStory & { segments: ISegment[] };

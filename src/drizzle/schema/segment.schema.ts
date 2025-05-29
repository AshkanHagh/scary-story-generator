import { pgTable } from "drizzle-orm/pg-core";
import { StoryTable } from "./story.schema";
import { relations } from "drizzle-orm";

export const SegmentTable = pgTable("segments", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    storyId: table
      .uuid()
      .notNull()
      .references(() => StoryTable.id),
    order: table.integer().notNull().default(0),
    text: table.text().notNull(),
    isGenerating: table.boolean().notNull().default(true),
    createdAt: table.timestamp().notNull().defaultNow(),
    updatedAt: table
      .timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
});

export const SegmentRelations = relations(SegmentTable, ({ one }) => ({
  story: one(StoryTable, {
    fields: [SegmentTable.storyId],
    references: [StoryTable.id],
  }),
}));

export type ISegment = typeof SegmentTable.$inferSelect;
export type ISegmentInsertForm = typeof SegmentTable.$inferInsert;

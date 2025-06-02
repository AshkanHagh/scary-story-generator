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
    prompt: table.text(),
    imageId: table.text(),
    previewImageId: table.text(),
    voiceId: table.text(),
    isGenerating: table.boolean().notNull().default(false),
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

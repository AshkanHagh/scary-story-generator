import { mysqlEnum } from "drizzle-orm/mysql-core";
import { StoryTable } from "./story.schema";
import { relations } from "drizzle-orm";
import { mysqlTable } from "drizzle-orm/mysql-core";
import { createdAt, id, updatedAt } from "../utils";

export const SegmentTable = mysqlTable("segments", (table) => {
  return {
    id,
    storyId: table
      .varchar({ length: 128 })
      .notNull()
      .references(() => StoryTable.id, { onDelete: "cascade" }),
    order: table.int().notNull().default(0),
    text: table.text().notNull(),
    prompt: table.text(),
    imageId: table.text(),
    voiceId: table.text(),
    imageUrl: table.text(),
    status: mysqlEnum(["pending", "failed", "completed"]).notNull(),
    createdAt,
    updatedAt,
  };
});

export type Segment = typeof SegmentTable.$inferSelect;

export const SegmentRelations = relations(SegmentTable, ({ one }) => ({
  story: one(StoryTable, {
    fields: [SegmentTable.storyId],
    references: [StoryTable.id],
  }),
}));

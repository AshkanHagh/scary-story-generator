import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { SegmentTable } from "./segment.schema";
import { mysqlTable, mysqlEnum } from "drizzle-orm/mysql-core";
import { createdAt, id, updatedAt } from "../utils";

export type StoryMeta = {
  speachId: string;
  subtitleId: string;
  videoDuration: number;
  totalSegments: number;
};

export const StoryTable = mysqlTable("stories", (table) => {
  return {
    id,
    userId: table
      .varchar({ length: 128 })
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    title: table.varchar({ length: 128 }).notNull(),
    script: table.varchar({ length: 10_000 }).notNull(),
    context: table.text(),
    meta: table.json().$type<StoryMeta>(),
    step: mysqlEnum(["initial", "segment", "video", "completed"])
      .notNull()
      .default("initial"),
    createdAt,
    updatedAt,
  };
});

export type Story = typeof StoryTable.$inferSelect;

export const StoryRelation = relations(StoryTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [StoryTable.userId],
    references: [UserTable.id],
  }),
  segments: many(SegmentTable),
}));

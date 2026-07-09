import { mysqlEnum, mysqlTable } from "drizzle-orm/mysql-core";
import { StoryTable } from "./story.schema";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { createdAt, id, updatedAt } from "../utils";

export const VideoTable = mysqlTable("videos", (table) => {
  return {
    id,
    userId: table
      .varchar({ length: 128 })
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    storyId: table
      .varchar({ length: 128 })
      .notNull()
      .references(() => StoryTable.id, { onDelete: "cascade" }),
    url: table.text(),
    status: mysqlEnum(["pending", "failed", "completed"]).notNull(),
    createdAt,
    updatedAt,
  };
});

export type Video = typeof VideoTable.$inferSelect;

export const VideoRelations = relations(VideoTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [VideoTable.userId],
    references: [UserTable.id],
  }),
  story: one(StoryTable, {
    fields: [VideoTable.storyId],
    references: [StoryTable.id],
  }),
}));

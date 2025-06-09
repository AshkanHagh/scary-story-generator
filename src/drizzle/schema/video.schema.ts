import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { StoryTable } from "./story.schema";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";

export const videoStatusEnum = pgEnum("video_status_enum", [
  "pending",
  "failed",
  "completed",
]);

export const VideoTable = pgTable("videos", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    userId: table
      .uuid()
      .references(() => UserTable.id)
      .notNull(),
    storyId: table
      .uuid()
      .references(() => StoryTable.id)
      .notNull(),
    url: table.text(),
    status: videoStatusEnum().notNull(),
    error: table.text(),
    createdAt: table.timestamp().defaultNow(),
    updatedAt: table
      .timestamp()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
});

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

export type IVideo = typeof VideoTable.$inferSelect;
export type IVideoInsertForm = typeof VideoTable.$inferInsert;
export type IVideoUpdateForm = Partial<typeof VideoTable.$inferInsert>;

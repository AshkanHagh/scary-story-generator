import { pgTable } from "drizzle-orm/pg-core";
import { StoryTable } from "./story.schema";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

export const VideoProcessingStatusTable = pgTable(
  "video_processing_status",
  (table) => {
    return {
      storyId: table
        .uuid()
        .primaryKey()
        .references(() => StoryTable.id, { onDelete: "cascade" }),
      totalSegments: table.smallint().notNull(),
      completedSegments: table.smallint().notNull().default(0),
      lastChecked: table
        .timestamp()
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    };
  },
);

export const VideoProcessingStatusRelations = relations(
  VideoProcessingStatusTable,
  ({ one }) => ({
    story: one(StoryTable, {
      fields: [VideoProcessingStatusTable.storyId],
      references: [StoryTable.id],
    }),
  }),
);

export type IVideoProcessingStatus = InferSelectModel<
  typeof VideoProcessingStatusTable
>;

export type IVideoProcessingStatusInsertForm = InferInsertModel<
  typeof VideoProcessingStatusTable
>;

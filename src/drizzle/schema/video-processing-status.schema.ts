import { pgTable } from "drizzle-orm/pg-core";
import { StoryTable } from "./story.schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const VideoProcessingStatusTable = pgTable(
  "video_processing_status",
  (table) => {
    return {
      storyId: table
        .uuid()
        .primaryKey()
        .references(() => StoryTable.id),
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

export type IVideoProcessingStatus = InferSelectModel<
  typeof VideoProcessingStatusTable
>;

export type IVideoProcessingStatusInsertForm = InferInsertModel<
  typeof VideoProcessingStatusTable
>;

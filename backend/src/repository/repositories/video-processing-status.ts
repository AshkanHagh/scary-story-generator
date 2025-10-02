import { Inject } from "@nestjs/common";
import { IVideoProcessingStatusRepository } from "../interfaces/repository";
import { DATABASE } from "src/drizzle/constant";
import { Database } from "src/drizzle/types";
import {
  IVideoProcessingStatusInsertForm,
  IVideoProcessingStatus,
  VideoProcessingStatusTable,
} from "src/drizzle/schema";
import { eq, sql } from "drizzle-orm";

export class VideoProcessingStatusRepository
  implements IVideoProcessingStatusRepository
{
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: IVideoProcessingStatusInsertForm): Promise<void> {
    await this.db.insert(VideoProcessingStatusTable).values(form).execute();
  }

  async updateCompletedSegment(
    storyId: string,
  ): Promise<IVideoProcessingStatus> {
    const result = await this.db
      .update(VideoProcessingStatusTable)
      .set({
        completedSegments: sql`${VideoProcessingStatusTable.completedSegments} + 1`,
      })
      .where(eq(VideoProcessingStatusTable.storyId, storyId))
      .returning();

    return result[0];
  }
}

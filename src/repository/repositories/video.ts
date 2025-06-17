import { Inject, Injectable } from "@nestjs/common";
import { IVideoRepository } from "../interfaces/repository";
import {
  IVideoInsertForm,
  IVideo,
  VideoTable,
  IVideoUpdateForm,
} from "src/drizzle/schema/video.schema";
import { DATABASE } from "src/drizzle/constant";
import { Database } from "src/drizzle/types";
import { eq } from "drizzle-orm";
import { StoryError, StoryErrorType } from "src/filter/exception";

@Injectable()
export class VideoRepository implements IVideoRepository {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: IVideoInsertForm): Promise<IVideo> {
    const [video] = await this.db.insert(VideoTable).values(form).returning();
    return video;
  }

  async update(id: string, form: IVideoUpdateForm): Promise<void> {
    await this.db.update(VideoTable).set(form).where(eq(VideoTable.id, id));
  }

  async find(id: string): Promise<IVideo> {
    const [video] = await this.db
      .select()
      .from(VideoTable)
      .where(eq(VideoTable.id, id));

    if (!video) {
      throw new StoryError(StoryErrorType.NotFound);
    }

    return video;
  }

  async userHasAccess(id: string, userId: string): Promise<void> {
    const videoUserId = await this.db.query.VideoTable.findFirst({
      where: (table, funcs) => funcs.eq(table.id, id),
      columns: {
        userId: true,
      },
    });

    if (!videoUserId) {
      throw new StoryError(StoryErrorType.NotFound);
    }

    if (videoUserId.userId !== userId) {
      throw new StoryError(StoryErrorType.HasNoPermission);
    }
  }

  async findAllByUserId(userId: string): Promise<IVideo[]> {
    const videos = await this.db
      .select()
      .from(VideoTable)
      .where(eq(VideoTable.userId, userId));

    return videos;
  }
}

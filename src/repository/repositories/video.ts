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
}

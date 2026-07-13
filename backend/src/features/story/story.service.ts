import { Injectable } from "@nestjs/common";
import { CreateStoryDto } from "./dtos";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { StoryTable } from "src/drizzle/schemas";
import { and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { StoryError, StoryErrorType } from "src/filters/exception";

@Injectable()
export class StoryService {
  constructor(@InjectDatabase() private db: Database) {}

  async create(userId: string, payload: CreateStoryDto) {
    const [story] = await this.db
      .insert(StoryTable)
      .values({
        ...payload,
        userId,
      })
      .$returningId();
    return await this.db.query.StoryTable.findFirst({
      where: eq(StoryTable.id, story.id),
    });
  }

  async get(userId: string, storyId: string) {
    const story = await this.db.query.StoryTable.findFirst({
      where: and(eq(StoryTable.id, storyId), eq(StoryTable.userId, userId)),
    });
    if (!story) {
      throw new StoryError(StoryErrorType.NOT_FOUND);
    }
    return story;
  }
}

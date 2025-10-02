import { Inject, Injectable } from "@nestjs/common";
import { IStoryRepository } from "../interfaces/repository";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constant";
import {
  IStoryInsertForm,
  IStory,
  StoryTable,
  IStoryView,
} from "src/drizzle/schema/story.schema";
import { eq } from "drizzle-orm";
import { StoryError, StoryErrorType } from "src/filter/exception";

@Injectable()
export class StoryRepository implements IStoryRepository {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: IStoryInsertForm): Promise<IStory> {
    const [story] = await this.db.insert(StoryTable).values(form).returning();
    return story;
  }

  async update(id: string, form: Partial<IStoryInsertForm>): Promise<void> {
    await this.db.update(StoryTable).set(form).where(eq(StoryTable.id, id));
  }

  async userHasAccess(storyId: string, userId: string): Promise<IStory> {
    const story = await this.db.query.StoryTable.findFirst({
      where: eq(StoryTable.id, storyId),
    });

    if (!story) {
      throw new StoryError(StoryErrorType.NotFound);
    }
    if (story.userId !== userId) {
      throw new StoryError(StoryErrorType.HasNoPermission);
    }

    return story;
  }

  async find(id: string): Promise<IStory | undefined> {
    const [story] = await this.db
      .select()
      .from(StoryTable)
      .where(eq(StoryTable.id, id));

    return story;
  }

  async findWithSegments(id: string): Promise<IStoryView | undefined> {
    const story = await this.db.query.StoryTable.findFirst({
      where: (table, funcs) => funcs.eq(table.id, id),
      with: {
        segments: true,
      },
    });

    return story;
  }
}

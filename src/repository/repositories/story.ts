import { Inject, Injectable } from "@nestjs/common";
import { IStoryRepository } from "../interfaces/repository";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constant";
import {
  IStoryInsertForm,
  IStory,
  StoryTable,
} from "src/drizzle/schema/story.schema";
import { eq } from "drizzle-orm";

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
}

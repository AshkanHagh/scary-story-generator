import { IUser, IUserInsertForm } from "src/drizzle/schema";
import { IStory, IStoryInsertForm } from "src/drizzle/schema/story.schema";

export interface IUserRepository {
  insert(form: IUserInsertForm): Promise<IUser>;
  update(id: string, form: Partial<IUserInsertForm>): Promise<void>;
  find(id: string): Promise<IUser | null>;
}

export interface IStoryRepository {
  insert(form: IStoryInsertForm): Promise<IStory>;
  update(id: string, form: Partial<IStoryInsertForm>): Promise<void>;
}

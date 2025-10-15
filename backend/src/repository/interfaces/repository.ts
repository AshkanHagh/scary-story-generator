import {
  ISegment,
  ISegmentInsertForm,
  IUser,
  IUserInsertForm,
} from "src/drizzle/schema";
import {
  IStory,
  IStoryInsertForm,
  IStoryView,
} from "src/drizzle/schema/story.schema";
import {
  IVideo,
  IVideoInsertForm,
  IVideoUpdateForm,
} from "src/drizzle/schema/video.schema";

export interface IUserRepository {
  insert(form: IUserInsertForm): Promise<IUser>;
  update(id: string, form: Partial<IUserInsertForm>): Promise<void>;
  find(id: string): Promise<IUser | null>;
}

export interface IStoryRepository {
  insert(form: IStoryInsertForm): Promise<IStory>;
  update(id: string, form: Partial<IStoryInsertForm>): Promise<void>;
  userHasAccess(storyId: string, userId: string): Promise<IStory>;
  find(id: string): Promise<IStory | undefined>;
  findWithSegments(id: string): Promise<IStoryView | undefined>;
}

export interface ISegmentRepository {
  insert(form: ISegmentInsertForm): Promise<ISegment>;
  update(id: string, form: Partial<ISegmentInsertForm>): Promise<void>;
  find(id: string): Promise<ISegment | undefined>;
}

export interface IVideoRepository {
  insert(form: IVideoInsertForm): Promise<IVideo>;
  update(id: string, form: IVideoUpdateForm): Promise<void>;
  userHasAccess(id: string, userId: string): Promise<void>;
  find(id: string): Promise<IVideo>;
  findAllByUserId(userId: string): Promise<IVideo[]>;
}

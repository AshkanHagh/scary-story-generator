import {
  ISegment,
  ISegmentInsertForm,
  IUser,
  IUserInsertForm,
  IVideoProcessingStatus,
  IVideoProcessingStatusInsertForm,
} from "src/drizzle/schema";
import {
  IStory,
  IStoryInsertForm,
  IStoryView,
} from "src/drizzle/schema/story.schema";

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

export interface IVideoProcessingStatusRepository {
  insert(form: IVideoProcessingStatusInsertForm): Promise<void>;
  updateCompletedSegment(
    storyId: string,
    form: Partial<IVideoProcessingStatusInsertForm>,
  ): Promise<IVideoProcessingStatus>;
}

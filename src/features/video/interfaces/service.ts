import { IVideoRecord } from "src/drizzle/schema";

export interface IVideoService {
  generateVideo(userId: string, storyId: string): Promise<string>;
  pollStoryVideoStatus(userId: string, storyId: string): Promise<IVideoRecord>;
  userVideos(userId: string): Promise<IVideoRecord[]>;
}

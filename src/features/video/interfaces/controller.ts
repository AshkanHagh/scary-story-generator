import { IVideoRecord } from "src/drizzle/schema";

export interface IVideoController {
  generateVideo(userId: string, storyId: string): Promise<void>;
  pollStoryVideoStatus(userId: string, storyId: string): Promise<IVideoRecord>;
  userVideos(userId: string): Promise<IVideoRecord[]>;
}

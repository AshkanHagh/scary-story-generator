import { InjectQueue } from "@nestjs/bullmq";
import { IVideoService } from "./interfaces/service";
import { ImageJobNames, WorkerEvents } from "src/worker/event";
import { Queue } from "bullmq";
import { RepositoryService } from "src/repository/repository.service";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { DownloadSegmentAssetJobData } from "src/worker/types";
import { IVideoRecord } from "src/drizzle/schema";
import { pollUntil } from "src/utils/poll";
import { Injectable } from "@nestjs/common";

@Injectable()
export class VideoService implements IVideoService {
  constructor(
    @InjectQueue(WorkerEvents.Image) private imageQueue: Queue,
    private repo: RepositoryService,
  ) {}

  async generateVideo(userId: string, storyId: string): Promise<string> {
    const story = await this.repo.story().findWithSegments(storyId);
    if (!story) {
      throw new StoryError(StoryErrorType.NotFound);
    }

    if (story.userId !== userId) {
      throw new StoryError(StoryErrorType.HasNoPermission);
    }

    story.segments.forEach((segment) => {
      if (segment.status === "pending") {
        throw new StoryError(StoryErrorType.NotCompleted);
      }
    });

    await this.repo.videoProcessingStatus().insert({
      storyId: story.id,
      totalSegments: story.segments.length,
      completedSegments: 0,
    });

    const video = await this.repo.video().insert({
      status: "pending",
      storyId: story.id,
      userId,
    });

    await Promise.all([
      story.segments.map((segment) => {
        const jobData: DownloadSegmentAssetJobData = {
          videoId: video.id,
          segment,
        };
        return this.imageQueue.add(
          ImageJobNames.DOWNLOAD_AND_GENERATE_SEGMENT_FRAME,
          jobData,
        );
      }),
    ]);

    return video.id;
  }

  async pollStoryVideoStatus(
    userId: string,
    videoId: string,
  ): Promise<IVideoRecord> {
    const pollInterval = 1000 * 1;

    const fetchFn = async () => {
      const video = await this.repo.video().find(videoId);
      if (video.userId !== userId) {
        throw new StoryError(StoryErrorType.HasNoPermission);
      }

      const videoRecord: IVideoRecord = {
        id: video.id,
        status: video.status,
        url: video.url,
        createdAt: video.createdAt,
        storyId: video.storyId,
        userId: video.userId,
      };
      return videoRecord;
    };

    const shouldResolve = (video: IVideoRecord) => {
      const hasChange = video.status !== "pending";
      return hasChange;
    };

    return await pollUntil(fetchFn, shouldResolve, {
      pollInterval,
    });
  }

  async userVideos(userId: string): Promise<IVideoRecord[]> {
    const videos = await this.repo.video().findAllByUserId(userId);
    if (videos.length === 0) {
      return [];
    }

    const videoRecords: IVideoRecord[] = videos.map((video) => ({
      id: video.id,
      status: video.status,
      url: video.url,
      createdAt: video.createdAt,
      storyId: video.storyId,
      userId: video.userId,
    }));

    return videoRecords;
  }
}

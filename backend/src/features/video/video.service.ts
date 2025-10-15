import { InjectFlowProducer } from "@nestjs/bullmq";
import { IVideoService } from "./interfaces/service";
import { ImageJobNames, VideoJobNames, WorkerEvents } from "src/worker/event";
import { FlowChildJob, FlowProducer } from "bullmq";
import { RepositoryService } from "src/repository/repository.service";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { IVideoRecord } from "src/drizzle/schema";
import { pollUntil } from "src/utils/poll";
import { Injectable } from "@nestjs/common";
import {
  CombineVideos,
  DownloadAsset,
  GenerateSegmentFrame,
  GenerateSegmentVideo,
} from "src/worker/types";
import { TmpDirService } from "./util-services/tmp-dir.service";
import * as path from "node:path";

@Injectable()
export class VideoService implements IVideoService {
  constructor(
    @InjectFlowProducer(WorkerEvents.Flow) private flowProducer: FlowProducer,
    private repo: RepositoryService,
  ) {}

  /*
    starts the flow of video creation
    generates all the disks path here and pass to jobs
  */
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

    const video = await this.repo.video().insert({
      status: "pending",
      storyId: story.id,
      userId,
    });

    // generates tmp dirs
    const tmpDirService = new TmpDirService();
    const [videoDir, audioDir, imageDir, srtDir, finishedVideoDir] =
      await Promise.all(
        Array(5)
          .fill(null)
          .map(() => tmpDirService.addDir()),
      );
    const allTmpDirs = tmpDirService.getAll();

    const segmentVideoJobs: FlowChildJob[] = [];
    for (const segment of story.segments) {
      const frameDirPath = await tmpDirService.addDir();
      allTmpDirs.push(frameDirPath);

      // join pathes for each segment
      const videoOrder = String(segment.order).padStart(2, "0");
      const videoPath = path.join(videoDir, `${segment.id}_${videoOrder}.mp4`);
      const audioPath = path.join(audioDir, `${segment.voiceId}.mp3`);
      const imagePath = path.join(imageDir, `${segment.imageId}.jpeg`);
      const srtPath = path.join(srtDir, `${segment.id}.srt`);

      segmentVideoJobs.push({
        name: VideoJobNames.GENERATE_VIDEO,
        queueName: WorkerEvents.Video,
        data: <GenerateSegmentVideo>{
          audioPath,
          frameDir: frameDirPath,
          srtPath,
          segmentId: segment.id,
          tmpDirs: { dirs: allTmpDirs },
          videoPath,
        },
        children: [
          {
            name: VideoJobNames.GENERATE_SEGMENT_FRAME,
            queueName: WorkerEvents.Video,
            data: <GenerateSegmentFrame>{
              audioPath,
              frameDir: frameDirPath,
              imagePath,
              segmentId: segment.id,
              srtPath,
              tmpDirs: { dirs: allTmpDirs },
            },
            children: [
              {
                name: ImageJobNames.DOWNLOAD_ASSETS,
                queueName: WorkerEvents.Image,
                data: <DownloadAsset>{
                  audioPath,
                  imageId: segment.imageId,
                  imagePath,
                  voiceId: segment.voiceId,
                  tmpDirs: { dirs: allTmpDirs },
                },
              },
            ],
          },
        ],
      });
    }

    const finishedVideoPath = path.join(finishedVideoDir, `${video.id}.mp4`);

    // flow: download assets -> generate segment frame -> generate segment video -> combine videos
    await this.flowProducer.add({
      name: VideoJobNames.COMBINE_VIDEOS,
      queueName: WorkerEvents.Video,
      data: <CombineVideos>{
        videoId: video.id,
        videoDir: videoDir,
        videoOutputPath: finishedVideoPath,
        tmpDirs: {
          dirs: allTmpDirs,
        },
      },
      children: segmentVideoJobs,
    });

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

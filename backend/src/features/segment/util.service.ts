import { Inject, Injectable } from "@nestjs/common";
import { RepositoryService } from "src/repository/repository.service";
import { InjectQueue } from "@nestjs/bullmq";
import { StoryJobNames, WorkerEvents } from "src/worker/event";
import { BulkJobOptions, Queue } from "bullmq";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { StoryAgentService } from "../llm-agent/services/story-agent.service";
import { ImageAgentService } from "../llm-agent/services/image-agent.service";
import { IStory } from "src/drizzle/schema";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { S3Service } from "../story/services/s3.service";
import { STORY_AGENT_SERVICE } from "../llm-agent/constants";
import { GenerateSegmentAudio, GenerateSegmentImage } from "src/worker/types";

@Injectable()
export class SegmentUtilService {
  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    private repo: RepositoryService,
    @Inject(STORY_AGENT_SERVICE) private storyAgentService: StoryAgentService,
    private imageAgentService: ImageAgentService,
    private s3Service: S3Service,
  ) {}

  /*
    NOTE: runs after story context completed
    generate segments from story and start generate image/audio for each segment
   */
  async generateSegmentsAndJobs(
    jobParentId: string,
    storyId: string,
    script: string,
  ) {
    const segmentJobs: {
      name: string;
      data: unknown;
      otps?: BulkJobOptions;
    }[] = [];
    const segments = script.split(/\n{2,}/);

    for (let i = 0; i < segments.length; i++) {
      const segment = await this.repo.segment().insert({
        storyId,
        text: segments[i],
        order: i,
        status: "pending",
      });

      segmentJobs.push(
        {
          name: StoryJobNames.GENERATE_SEGMENT_IMAGE,
          data: <GenerateSegmentImage>{
            storyId,
            segmentId: segment.id,
            segment: segments[i],
          },
          otps: {
            parent: {
              id: jobParentId,
              queue: StoryJobNames.GENERATE_STORY_CONTEXT,
            },
          },
        },
        {
          name: StoryJobNames.GENERATE_SEGMENT_VOICE,
          data: <GenerateSegmentAudio>{
            segment: segments[i],
            segmentId: segment.id,
          },
          otps: {
            parent: {
              id: jobParentId,
              queue: StoryJobNames.GENERATE_STORY_CONTEXT,
            },
          },
        },
      );
    }

    await this.storyQueue.addBulk(segmentJobs);
  }

  async generateStoryContext(storyId: string, script: string): Promise<void> {
    const context = await this.storyAgentService.generateStoryContext(script);
    await this.repo.story().update(storyId, { context });
  }

  /*
    generates image prompt from story segment
    generates image from prompt and upload to s3
    updates segments table(this function will mark segment as completed)
  */
  async generateSegmentImage(
    storyId: string,
    segmentId: string,
    segment: string,
  ): Promise<void> {
    const story = (await this.repo.story().find(storyId)) as IStory;
    console.log(story.context);

    const prompt = await this.storyAgentService.generateSegmentImagePrompt(
      // story context already generated
      story.context!,
      segment,
    );

    try {
      let output: string;
      if (process.env.NODE_ENV === "production") {
        output = await this.imageAgentService.generateImageUsingFlux({
          prompt,
          num_outputs: 1,
          disable_safety_checker: false,
          aspect_ratio: "16:9",
          output_format: "jpg",
          output_quality: 90,
        });
      } else {
        output =
          "https://fastly.picsum.photos/id/136/1080/720.jpg?hmac=C8l17RLTHDzR3pYXPzVE1J-guaFGe6_7ifKoVmFuYUY";
      }

      let resizedImageBuf: Buffer<ArrayBuffer>;
      try {
        const response = await fetch(output);
        const imageBuffer = Buffer.from(await response.arrayBuffer());

        resizedImageBuf = await sharp(imageBuffer)
          .webp({ quality: 90 })
          .toBuffer();
      } catch (error) {
        throw new StoryError(StoryErrorType.ImageGenerationFailed, error);
      }

      const imageId = randomUUID();
      const url = await this.s3Service.putObject(
        imageId,
        "image/webp",
        resizedImageBuf,
      );
      // mark as completed because the image takes longer then voice to generate so the last task is image
      await this.repo.segment().update(segmentId, {
        status: "completed",
        prompt,
        imageId,
        imageUrl: url,
      });
    } catch (error: unknown) {
      await this.repo.segment().update(segmentId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });

      throw new StoryError(StoryErrorType.FailedToGenerateImage, error);
    }
  }

  // generates segment audio and upload to s3 and updates segment table
  async generateSegmentVoice(
    segmentId: string,
    segment: string,
  ): Promise<void> {
    try {
      const buffer = await this.storyAgentService.generateSegmentVoice(segment);

      const voiceId = randomUUID();
      await this.s3Service.putObject(voiceId, "audio/mpeg", buffer);
      await this.repo.segment().update(segmentId, { voiceId });
    } catch (error: unknown) {
      await this.repo.segment().update(segmentId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StoryError(StoryErrorType.AudioGenerationFailed, error);
    }
  }
}

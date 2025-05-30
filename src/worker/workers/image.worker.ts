import { Processor, WorkerHost } from "@nestjs/bullmq";
import { WorkerEvents } from "../event";
import { Job } from "bullmq";
import { RegenrateSegmentImageJobData } from "../types";
import { RepositoryService } from "src/repository/repository.service";
import { SegmentTable, StoryTable } from "src/drizzle/schema";
import { eq } from "drizzle-orm";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { ImageAgentService } from "src/features/llm-agent/services/image-agent.service";

@Processor(WorkerEvents.Image, { concurrency: 20 })
export class ImageWorker extends WorkerHost {
  constructor(
    private repo: RepositoryService,
    private imageAgent: ImageAgentService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const payload = job.data as RegenrateSegmentImageJobData;

    const [segment] = await this.repo
      .db()
      .select()
      .from(SegmentTable)
      .where(eq(SegmentTable.id, payload.segmentId));

    if (!segment) {
      throw new StoryError(StoryErrorType.FailedToGenerateStory);
    }

    const [story] = await this.repo
      .db()
      .select()
      .from(StoryTable)
      .where(eq(StoryTable.id, segment.storyId));

    if (!story) {
      throw new StoryError(StoryErrorType.FailedToGenerateStory);
    }

    await this.repo
      .db()
      .update(SegmentTable)
      .set({ isGenerating: true })
      .where(eq(SegmentTable.id, segment.id));

    const isVertical = story.isVertical ?? false;
    const width = isVertical ? 1080 : 1920;
    const height = isVertical ? 1920 : 1080;

    const model = "flux";

    try {
      let output: string;

      if (model === "flux") {
        output = await this.imageAgent.generateImageUsingFlux({
          prompt: payload.prompt,
          num_outputs: 1,
          disable_safety_checker: false,
          aspect_ratio: isVertical ? "9:16" : "16:9",
          output_format: "jpg",
          output_quality: 90,
        });
      } else {
        output = "";
      }

      // TODO: scale the image down
      // TODO: store the image in s3

      await this.repo.segment().update(segment.id, {
        isGenerating: false,
        prompt: payload.prompt,
        imageId: output, // NOTE: this is the s3 image id not the url i just put url and refactor it later
        previewImageId: "",
      });
    } catch (error: unknown) {
      await this.repo.segment().update(segment.id, {
        isGenerating: false,
      });
      throw new StoryError(StoryErrorType.FailedToGenerateStory, error);
    }
  }
}

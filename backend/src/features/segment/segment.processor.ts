import { Processor, WorkerHost } from "@nestjs/bullmq";
import { SEGMENT_QUEUE } from "./constants";
import { Job } from "bullmq";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { LlmService } from "../llm/llm.service";
import { S3Service } from "../assets/services/s3.service";
import { eq } from "drizzle-orm";
import { SegmentTable, StoryTable } from "src/drizzle/schemas";
import { randomUUID } from "node:crypto";
import { StoryError, StoryErrorType } from "src/filters/exception";

// using 1 concurrency to limit the ai usage
@Processor(SEGMENT_QUEUE, { concurrency: 1 })
export class SegmentWorker extends WorkerHost {
  constructor(
    @InjectDatabase() private db: Database,
    private llmService: LlmService,
    private s3Service: S3Service,
  ) {
    super();
  }

  async process(job: Job) {
    try {
      switch (job.name) {
        case "segment-generate-image": {
          await this.generateImage(job.data);
          break;
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async generateImage(payload: {
    storyId: string;
    segmentId: string;
    text: string;
  }) {
    try {
      const story = await this.db.query.StoryTable.findFirst({
        where: eq(StoryTable.id, payload.storyId),
      });

      const imageId = randomUUID();
      const imagePrompt = await this.llmService.genSegmentImagePrompt(
        story!.context!,
        payload.text,
      );
      const image = await this.llmService.genSegmentImage(imagePrompt);
      const imageUrl = await this.s3Service.putObject(
        payload.storyId,
        imageId,
        image.contentType,
        Buffer.from(image.buffer),
      );

      await this.db
        .update(SegmentTable)
        .set({
          status: "completed",
          prompt: imagePrompt,
          imageUrl,
        })
        .where(eq(SegmentTable.id, payload.segmentId));
    } catch (error) {
      throw new StoryError(StoryErrorType.IMAGE_GENERATION_FAILED, error);
    }
  }
}

import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { InjectDatabase } from "src/drizzle/constants";
import { SegmentTable, StoryTable } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { LlmService } from "src/features/llm/llm.service";
import { S3Service } from "src/features/story/services/s3.service";
import { StoryError, StoryErrorType } from "src/filters/exception";

@Injectable()
export class SegmentWorkerService {
  constructor(
    @InjectDatabase() private db: Database,
    private llmService: LlmService,
    private s3Service: S3Service,
  ) {}

  async generateImage(payload: {
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

import { Processor } from "@nestjs/bullmq";
import { SEGMENT_QUEUES } from "./constants";
import { Job } from "bullmq";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { eq } from "drizzle-orm";
import { SegmentTable, Story } from "src/drizzle/schemas";
import { randomUUID } from "node:crypto";
import { AiService } from "../ai/ai.service";
import { StorageService } from "../storage/storage.service";
import storageKey from "src/utils/storage-key";
import { Logger } from "@nestjs/common";
import { BaseProcessor, QueueJob } from "src/queue/base-queue";
import { SEGMENT_QUEUE } from "src/queue/constants";

export type GenSpeachJob = {
  storyId: string;
  script: string;
};

export type GenSegmentImage = {
  story: Story;
  segmentId: string;
  text: string;
};

@Processor(SEGMENT_QUEUE)
export class SegmentProcessor extends BaseProcessor {
  protected logger = new Logger(SegmentProcessor.name);

  constructor(
    @InjectDatabase() private db: Database,
    private aiService: AiService,
    private storageService: StorageService,
  ) {
    super();
  }

  async handle(job: Job<QueueJob<any>>) {
    switch (job.name) {
      case SEGMENT_QUEUES.SPEACH: {
        // return await this.genStorySpeach(job);
      }
      case SEGMENT_QUEUES.IMAGE: {
        // return await this.genSegmentImage(job);
      }
    }
  }

  private async genSegmentImage(job: Job<QueueJob<GenSegmentImage>>) {
    const { payload } = job.data;
    const imageId = randomUUID();

    const imagePrompt = await this.aiService.genSegmentImagePrompt(
      payload.story.context!,
      payload.text,
    );
    const image = await this.aiService.genSegmentImage(imagePrompt);
    const imageUrl = await this.storageService.upload(
      storageKey(payload.story.id, imageId),
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
  }

  private async genStorySpeach(job: Job<QueueJob<GenSpeachJob>>) {
    const { payload } = job.data;
    const result = await this.aiService.genSpeach(payload.script);
    const [speachId, subtitleId] = [randomUUID(), randomUUID()] as string[];

    await Promise.all([
      this.storageService.upload(
        storageKey(payload.storyId, speachId),
        result.speach.contentType,
        result.speach.buffer,
      ),
      this.storageService.upload(
        storageKey(payload.storyId, subtitleId),
        result.subtitle.contentType,
        result.subtitle.text,
      ),
    ]);
  }
}

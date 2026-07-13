import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { LlmService } from "../llm/llm.service";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { StoryTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { S3Service } from "../assets/services/s3.service";
import { randomUUID } from "node:crypto";
import { Logger } from "@nestjs/common";

@Processor("story", { concurrency: 1 })
export class StoryWorker extends WorkerHost {
  private logger = new Logger(StoryWorker.name);

  constructor(
    @InjectDatabase() private db: Database,
    private s3Service: S3Service,
    private llmService: LlmService,
  ) {
    super();
  }

  async process(job: Job) {
    try {
      switch (job.name) {
        case "story-generate-context": {
          await this.genStoryContext(job.data);
          break;
        }
        case "story-generate-audio": {
          await this.genStoryAudio(job.data);
          break;
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async genStoryContext(payload: { storyId: string; story: string }) {
    const context = await this.llmService.genStoryContext(payload.story);
    await this.db
      .update(StoryTable)
      .set({ context })
      .where(eq(StoryTable.id, payload.storyId));
  }

  private async genStoryAudio(payload: { storyId: string; story: string }) {
    const audio = await this.llmService.generateAudio(payload.story);
    const audioId = randomUUID();
    await this.s3Service.putObject(
      payload.storyId,
      audioId,
      audio.contentType,
      Buffer.from(audio.buffer),
    );
  }
}

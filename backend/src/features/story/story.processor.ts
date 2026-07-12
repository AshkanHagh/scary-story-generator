import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { LlmService } from "../llm/llm.service";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { StoryTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";

type GenStoryContextPayload = {
  storyId: string;
  story: string;
};

@Processor("story", { concurrency: 10 })
export class StoryWorker extends WorkerHost {
  constructor(
    @InjectDatabase() private db: Database,
    private llmService: LlmService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case "story-generate-context": {
        await this.genStoryContext(job.data);
        break;
      }
    }
  }

  private async genStoryContext(payload: GenStoryContextPayload) {
    const context = await this.llmService.genStoryContext(payload.story);
    await this.db
      .update(StoryTable)
      .set({ context })
      .where(eq(StoryTable.id, payload.storyId));
  }
}

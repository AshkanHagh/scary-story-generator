import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "src/drizzle/constants";
import { QuotaInsertForm, QuotaTable } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { StoryError, StoryErrorType } from "src/filters/exception";

type QuotaConsume = {
  stories: number;
  images: number;
  voiceChars: number;
};

@Injectable()
export class QuotaService {
  // free ai providers that i use have credit limits
  // by using 2 story per, this workes around 10 11 day after host
  private config = {
    storyPerDay: 2,
    imageGenPerDay: 8,
    imageGenPerStory: 4,
    voiceCharPerStory: 400,
  };

  constructor(@InjectDatabase() private db: Database) {}

  async consume(payload: QuotaConsume) {
    let quota = await this.db.query.QuotaTable.findFirst();
    if (!quota) {
      await this.db.insert(QuotaTable).values({
        storiesUsed: 0,
        imagesUsed: 0,
      });
      quota = (await this.db.query.QuotaTable.findFirst())!;
    }
    const quotaUpdateForm: QuotaInsertForm = {
      storiesUsed: payload.stories,
      imagesUsed: payload.images,
    };

    if (quota.resetAt < new Date()) {
      quotaUpdateForm.storiesUsed = 0;
      quotaUpdateForm.imagesUsed = 0;
      quotaUpdateForm.resetAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    }
    if (quota.storiesUsed + payload.stories > this.config.storyPerDay) {
      throw new StoryError(StoryErrorType.QUOTA_LIMIT_REACHED, {
        message: "stories limit reached",
      });
    }
    if (
      quota.imagesUsed + payload.images > this.config.imageGenPerStory ||
      quota.imagesUsed + payload.images > this.config.imageGenPerDay
    ) {
      throw new StoryError(StoryErrorType.QUOTA_LIMIT_REACHED, {
        message: "images limit reached",
      });
    }
    if (payload.voiceChars > this.config.voiceCharPerStory) {
      throw new StoryError(StoryErrorType.QUOTA_LIMIT_REACHED, {
        message: "voice chars limit reached",
      });
    }
    await this.db.update(QuotaTable).set(quotaUpdateForm);
  }
}

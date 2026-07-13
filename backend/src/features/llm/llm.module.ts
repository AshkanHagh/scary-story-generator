import { Module } from "@nestjs/common";
import { LlmService } from "./llm.service";
import { QuotaService } from "./quota.service";

@Module({
  providers: [LlmService, QuotaService],
  exports: [LlmService, QuotaService],
})
export class LlmModule {}

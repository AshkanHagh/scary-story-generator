import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { SEGMENT_FLOW_PRODUCER, SEGMENT_QUEUE } from "./constants";

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
      connection: {
        url: process.env.REDIS_URL!,
      },
    }),
    BullModule.registerQueue({
      name: SEGMENT_QUEUE,
    }),
    BullModule.registerFlowProducer({
      name: SEGMENT_FLOW_PRODUCER,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}

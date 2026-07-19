import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("video", { concurrency: 5 })
export class VideoWorker extends WorkerHost {
  constructor() {
    super();
  }

  async process(job: Job) {}
}

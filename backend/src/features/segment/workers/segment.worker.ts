import { Processor, WorkerHost } from "@nestjs/bullmq";
import { SEGMENT_QUEUE } from "../constants";
import { Job } from "bullmq";
import { SegmentWorkerService } from "./segment-worker.service";

@Processor(SEGMENT_QUEUE, { concurrency: 5 })
export class SegmentWorker extends WorkerHost {
  constructor(private workerService: SegmentWorkerService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case "segment-generate-image": {
        await this.workerService.generateImage(job.data);
        break;
      }
    }
  }
}

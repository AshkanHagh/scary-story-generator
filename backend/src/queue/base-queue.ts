import { WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

export type QueueJob<T> = {
  payload: T;
  trace: {
    reqId: string;
    userId: string;
  };
};

export abstract class BaseProcessor extends WorkerHost {
  protected abstract readonly logger: Logger;

  async process(job: Job<QueueJob<any>>): Promise<any> {
    const trace = job.data.trace;
    const traceLog = `req_id=${trace.reqId} userId=${trace.userId}`;
    this.logger.log(`job_started job=${job.name} ${traceLog}`);

    try {
      const result = await this.handle(job);
      this.logger.log(`job_completed job=${job.name} ${traceLog}`);
      return result;
    } catch (error) {
      this.logger.error(
        { err: error },
        `job=${job.name} attempt=${job.attemptsMade}/${job.opts.attempts!} ${traceLog}`,
      );
    }
  }

  protected abstract handle<T>(job: Job<QueueJob<T>>): Promise<unknown>;
}

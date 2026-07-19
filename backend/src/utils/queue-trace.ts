import { FastifyRequest } from "fastify";
import { QueueJob } from "src/queue/base-queue";

export function withTrace<T>(req: FastifyRequest, payload: T): QueueJob<T> {
  console.log(req.headers);
  return {
    payload,
    trace: {
      reqId: req.id,
      userId: req.user!.id,
    },
  };
}

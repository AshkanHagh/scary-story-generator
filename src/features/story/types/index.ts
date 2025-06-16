import { ISegment } from "src/drizzle/schema";

export type PollSegmentsStatusResponse = {
  segments: ISegment[];
  isCompleted: boolean;
};

export type PollConfig = {
  pollInterval: number;
  maxWaitTime?: number;
};

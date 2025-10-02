import { ISegment } from "src/drizzle/schema";
import { PollSegmentsStatusResponse } from "../types";

export interface ISegmentService {
  generateSegment(userId: string, storyId: string): Promise<void>;
  getSegments(userId: string, storyId: string): Promise<ISegment[]>;
  pollSegmentStatus(
    userId: string,
    storyId: string,
  ): Promise<PollSegmentsStatusResponse>;
}

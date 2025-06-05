import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "./repositories/user";
import { DATABASE } from "src/drizzle/constant";
import { Database } from "src/drizzle/types";
import { IRepositoryService } from "./interfaces/service";
import { StoryRepository } from "./repositories/story";
import { SegmentRepository } from "./repositories/segment";
import { VideoProcessingStatusRepository } from "./repositories/video-processing-status";

@Injectable()
export class RepositoryService implements IRepositoryService {
  constructor(
    private User: UserRepository,
    private Story: StoryRepository,
    private Segment: SegmentRepository,
    private VideoProcessingStatus: VideoProcessingStatusRepository,
    @Inject(DATABASE) private conn: Database,
  ) {}

  user(): UserRepository {
    return this.User;
  }

  story(): StoryRepository {
    return this.Story;
  }

  segment(): SegmentRepository {
    return this.Segment;
  }

  videoProcessingStatus(): VideoProcessingStatusRepository {
    return this.VideoProcessingStatus;
  }

  db(): Database {
    return this.conn;
  }
}

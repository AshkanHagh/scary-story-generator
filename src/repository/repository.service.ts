import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "./repositories/user";
import { DATABASE } from "src/drizzle/constant";
import { Database } from "src/drizzle/types";
import { IRepositoryService } from "./interfaces/service";
import { StoryRepository } from "./repositories/story";
import { SegmentRepository } from "./repositories/segment";

@Injectable()
export class RepositoryService implements IRepositoryService {
  constructor(
    private User: UserRepository,
    private Story: StoryRepository,
    private Segment: SegmentRepository,
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

  db(): Database {
    return this.conn;
  }
}

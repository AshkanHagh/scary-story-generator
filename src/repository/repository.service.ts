import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "./repositories/user";
import { DATABASE } from "src/drizzle/constant";
import { Database } from "src/drizzle/types";
import { IRepositoryService } from "./interfaces/service";
import { StoryRepository } from "./repositories/story";

@Injectable()
export class RepositoryService implements IRepositoryService {
  constructor(
    private User: UserRepository,
    private Story: StoryRepository,
    @Inject(DATABASE) private conn: Database,
  ) {}

  user(): UserRepository {
    return this.User;
  }

  story(): StoryRepository {
    return this.Story;
  }

  db(): Database {
    return this.conn;
  }
}

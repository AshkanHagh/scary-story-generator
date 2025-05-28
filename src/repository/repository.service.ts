import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "./repositories/user";
import { DATABASE } from "src/drizzle/constant";
import { Database } from "src/drizzle/types";
import { IRepositoryService } from "./interfaces/service";

@Injectable()
export class RepositoryService implements IRepositoryService {
  constructor(
    private User: UserRepository,
    @Inject(DATABASE) private conn: Database,
  ) {}

  user(): UserRepository {
    return this.User;
  }

  db(): Database {
    return this.conn;
  }
}

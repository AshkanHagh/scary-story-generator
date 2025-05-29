import { Database } from "src/drizzle/types";
import { UserRepository } from "../repositories/user";
import { StoryRepository } from "../repositories/story";

export interface IRepositoryService {
  user(): UserRepository;
  story(): StoryRepository;
  db(): Database;
}

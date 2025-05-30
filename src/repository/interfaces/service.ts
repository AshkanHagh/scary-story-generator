import { Database } from "src/drizzle/types";
import { UserRepository } from "../repositories/user";
import { StoryRepository } from "../repositories/story";
import { SegmentRepository } from "../repositories/segment";

export interface IRepositoryService {
  user(): UserRepository;
  story(): StoryRepository;
  segment(): SegmentRepository;
  db(): Database;
}

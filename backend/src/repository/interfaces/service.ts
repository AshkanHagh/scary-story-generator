import { Database } from "src/drizzle/types";
import { UserRepository } from "../repositories/user";
import { StoryRepository } from "../repositories/story";
import { SegmentRepository } from "../repositories/segment";
import { VideoRepository } from "../repositories/video";

export interface IRepositoryService {
  user(): UserRepository;
  story(): StoryRepository;
  segment(): SegmentRepository;
  video(): VideoRepository;
  db(): Database;
}

import { Database } from "src/drizzle/types";
import { UserRepository } from "../repositories/user";

export interface IRepositoryService {
  user(): UserRepository;
  db(): Database;
}

import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { RepositoryService } from "./repository.service";
import { UserRepository } from "./repositories/user";

@Module({
  imports: [DrizzleModule],
  providers: [RepositoryService, UserRepository],
  exports: [RepositoryService],
})
export class RepositoryModule {}

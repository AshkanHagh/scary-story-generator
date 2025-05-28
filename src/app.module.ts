import { Module } from "@nestjs/common";
import { ConfigModule } from "./configs/config.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./features/auth/auth.module";
import { RepositoryModule } from "./repository/repository.module";

@Module({
  imports: [
    ConfigModule.register(),
    DrizzleModule,
    AuthModule,
    RepositoryModule,
  ],
})
export class AppModule {}

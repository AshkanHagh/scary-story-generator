import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigModule } from "src/configs/config.module";
import { RepositoryModule } from "src/repository/repository.module";
import { TokenService } from "./services/token.service";
import { AnonymousJwtStrategy } from "./strategies/anonymous-jwt.strategy";
import { AnonymousAuthGuard } from "./guards/anonymous-auth.guard";

@Module({
  imports: [RepositoryModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    AnonymousJwtStrategy,
    AnonymousAuthGuard,
  ],
  exports: [AnonymousAuthGuard, AnonymousJwtStrategy],
})
export class AuthModule {}

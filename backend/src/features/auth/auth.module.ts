import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AnonymousAuthGuard } from "./guards/auth.guard";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.AUTH_TOKEN_SECRET!,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AnonymousAuthGuard, JwtStrategy],
  exports: [AnonymousAuthGuard],
})
export class AuthModule {}

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { AnonymousJwtStrategy } from "../strategies/anonymous-jwt.strategy";

@Injectable()
export class AnonymousAuthGuard implements CanActivate {
  constructor(private strategy: AnonymousJwtStrategy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    const authorization = req.headers.authorization;
    if (!authorization || !authorization.includes("Bearer ")) {
      throw new StoryError(StoryErrorType.Unauthorized);
    }

    const anonymouseToken = authorization.split("Bearer ")[1];
    const user = await this.strategy.validate(anonymouseToken);

    req.user = user;
    return true;
  }
}

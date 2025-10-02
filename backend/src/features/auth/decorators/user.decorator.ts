import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { IUser } from "src/drizzle/schema";

export const User = createParamDecorator(
  (user: keyof IUser | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (!user) {
      return req.user;
    }

    return req.user && req.user[user];
  },
);

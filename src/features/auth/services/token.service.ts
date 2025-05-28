import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { AnonymousPayload } from "../types";
import { AuthConfig, IAuthConfig } from "src/configs/auth.config";
import { StoryError, StoryErrorType } from "src/filter/exception";

@Injectable()
export class TokenService {
  constructor(@AuthConfig() private config: IAuthConfig) {}

  sign(userId: string): string {
    const { exp, ...payload }: AnonymousPayload = {
      sub: userId,
      exp: this.config.anonymousToken.exp,
      iat: Math.floor(Date.now() / 1000),
      iss: "localhost",
    };

    const token = jwt.sign(payload, this.config.anonymousToken.secret!, {
      expiresIn: exp,
    });

    return token;
  }

  verify(token: string): string {
    try {
      const claims = jwt.verify(token, this.config.anonymousToken.secret!, {
        issuer: "localhost",
      }) as AnonymousPayload;

      return claims.sub;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.InvalidToken, error);
    }
  }
}

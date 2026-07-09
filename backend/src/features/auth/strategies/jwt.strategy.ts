import { PassportStrategy } from "@nestjs/passport";
import { eq } from "drizzle-orm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectDatabase } from "src/drizzle/constants";
import { UserTable } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { StoryError, StoryErrorType } from "src/filters/exception";

export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(@InjectDatabase() private db: Database) {
    super({
      secretOrKey: process.env.AUTH_TOKEN_SECRET!,
      ignoreExpiration: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: { id: string }) {
    const user = await this.db.query.UserTable.findFirst({
      where: eq(UserTable.id, payload.id),
    });
    if (!user) {
      throw new StoryError(StoryErrorType.UNAUTHORIZED);
    }
    return user;
  }
}

import { RepositoryService } from "src/repository/repository.service";
import { TokenService } from "../services/token.service";
import { Injectable } from "@nestjs/common";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { IUser } from "src/drizzle/schema";

@Injectable()
export class AnonymousJwtStrategy {
  constructor(
    private repo: RepositoryService,
    private tokenService: TokenService,
  ) {}

  async validate(token: string): Promise<IUser> {
    const userId = this.tokenService.verify(token);
    const user = await this.repo.user().find(userId);

    if (!user) {
      throw new StoryError(StoryErrorType.Unauthorized);
    }

    return user;
  }
}

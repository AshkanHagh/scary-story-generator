import { Injectable } from "@nestjs/common";
import { IAuthService } from "./interfaces/service";
import { RepositoryService } from "src/repository/repository.service";
import { TokenService } from "./services/token.service";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private repo: RepositoryService,
    private tokenService: TokenService,
  ) {}

  async anonymousAuth(): Promise<string> {
    const anonymousUser = await this.repo.user().insert({
      isAnonymous: true,
    });

    const token = this.tokenService.sign(anonymousUser.id);
    await this.repo.user().update(anonymousUser.id, { token });

    return token;
  }
}

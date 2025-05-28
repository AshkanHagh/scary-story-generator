import { Controller, Post } from "@nestjs/common";
import { IAuthController } from "./interfaces/controller";
import { AuthService } from "./auth.service";
import { AnonymousAuthResponse } from "./types";

@Controller("auth")
export class AuthController implements IAuthController {
  constructor(private authService: AuthService) {}

  @Post("/anonymous")
  async anonymousAuth(): Promise<AnonymousAuthResponse> {
    const token = await this.authService.anonymousAuth();
    return { token };
  }
}

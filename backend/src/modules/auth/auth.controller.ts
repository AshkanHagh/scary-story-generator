import { Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/anonymous")
  async anonymousAuth() {
    const token = await this.authService.anonymousAuth();
    return { token };
  }
}

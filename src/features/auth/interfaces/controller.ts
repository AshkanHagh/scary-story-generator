import { AnonymousAuthResponse } from "../types";

export interface IAuthController {
  anonymousAuth(): Promise<AnonymousAuthResponse>;
}

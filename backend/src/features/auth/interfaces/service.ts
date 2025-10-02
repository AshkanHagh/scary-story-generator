import { AnonymousAuthResponse } from "../types";

export interface IAuthService {
  anonymousAuth(): Promise<string>;
}

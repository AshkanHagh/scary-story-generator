import { Inject } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";

export const authConfig = registerAs("auth", () => {
  return {
    anonymousToken: {
      secret: process.env.ANONYMOUS_TOKEN_SECRET,
      exp: 60 * 60 * 12,
    },
  };
});

export const AuthConfig = () => Inject(authConfig.KEY);
export type IAuthConfig = ConfigType<typeof authConfig>;

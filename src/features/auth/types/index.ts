import { IUser } from "src/drizzle/schema";

export type AnonymousPayload = {
  exp: number;
  iss: string;
  iat: number;
  sub: string;
};

export type AnonymousAuthResponse = {
  token: string;
};

import { IUser } from "src/drizzle/schema";

declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

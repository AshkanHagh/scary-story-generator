import { WsAnonymousAuthGuard } from "src/features/auth/guards/ws-anonymous-auth.guard";
import { WsAnonymousMiddleware } from "./types";
import { Socket } from "socket.io";

export function WsAnonymouseAuthMiddleware(
  guard: WsAnonymousAuthGuard,
): WsAnonymousMiddleware {
  // eslint-disable-next-line
  return async (socket: Socket, next) => {
    try {
      await guard.validateToken(socket);
      next();
    } catch (error: unknown) {
      next(error);
    }
  };
}

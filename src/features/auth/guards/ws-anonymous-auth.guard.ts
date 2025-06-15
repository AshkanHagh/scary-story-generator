import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { AnonymousJwtStrategy } from "../strategies/anonymous-jwt.strategy";

@Injectable()
export class WsAnonymousAuthGuard implements CanActivate {
  constructor(private strategy: AnonymousJwtStrategy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "ws") {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    await this.validateToken(client);

    return true;
  }

  async validateToken(client: Socket) {
    let token: string;
    if (process.env.NODE_ENV === "production") {
      token = "";
    } else {
      const { authorization } = client.handshake.headers;
      if (!authorization || !authorization.startsWith("Bearer ")) {
        return false;
      }

      token = authorization.split(" ")[1];
    }

    const user = await this.strategy.validate(token);
    // eslint-disable-next-line
    client.data.userId = user.id;
  }
}

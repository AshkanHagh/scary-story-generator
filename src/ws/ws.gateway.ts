import { Logger, UseGuards } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsAnonymousAuthGuard } from "src/features/auth/guards/ws-anonymous-auth.guard";
import { WsConnectedUser } from "./types";
import { WsAnonymouseAuthMiddleware } from "./utils";

@WebSocketGateway(7318, { cors: { origin: "*" } })
@UseGuards(WsAnonymousAuthGuard)
export class WsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private users: Map<string, WsConnectedUser> = new Map();
  private logger = new Logger("Websocket");

  @WebSocketServer() server: Server;

  constructor(private wsAnonymousGuard: WsAnonymousAuthGuard) {}

  afterInit(server: Socket) {
    this.logger.log("WebSocket Gateway initialized");
    // @ts-expect-error nest give us wrong types
    server.use(WsAnonymouseAuthMiddleware(this.wsAnonymousGuard));
  }

  handleConnection(client: Socket): void {
    // eslint-disable-next-line
    const userId: string = client.data.userId;
    this.users.set(client.id, {
      id: userId,
      socketId: client.id,
    });
  }

  handleDisconnect(client: Socket): void {
    const user = this.users.get(client.id);
    if (user) {
      this.users.delete(client.id);
    }
  }

  sendMessage<T>(userId: string, event: string, data: T): void {
    const user = Array.from(this.users.values()).find(
      (user) => user.id === userId,
    );
    if (user) {
      this.server.to(user.socketId).emit(event, data);
    }
  }
}

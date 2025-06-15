import { NextFunction } from "express";
import { Socket } from "socket.io";

export type WsConnectedUser = {
  id: string;
  socketId: string;
};

export type WsAnonymousMiddleware = (
  client: Socket,
  next: NextFunction,
) => void;

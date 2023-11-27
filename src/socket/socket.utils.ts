import express from "express";
import { SOCKETEVENT } from "../socket/event";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketData } from "../types/socket";

export const emitSocketEvent = (
  req: express.Request,
  roomId: string,
  event: SOCKETEVENT,
  data: any
) => {
  (
    req.app.get("io") as unknown as Server<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      SocketData
    >
  )
    .in(roomId)
    .emit(event, data);
};

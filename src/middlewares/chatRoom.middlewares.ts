import express from "express";
import { tryCatchMiddleware } from "./handler.middlewares";
import { ExpressRequestExtended } from "../types/request";
import { ForbiddenError } from "../lib/error";
import { findChatRoomById } from "../utils/chat/chat.utils";

export const protectChatRoom = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { userId } = req as ExpressRequestExtended;
    const { roomId } = req.params;

    const room = await findChatRoomById(Number(roomId), Number(userId));

    if (
      !room?.participants.some(
        (user) => user.role === "admin" && user.user.id === Number(userId)
      )
    ) {
      throw new ForbiddenError();
    }

    next();
  }
);

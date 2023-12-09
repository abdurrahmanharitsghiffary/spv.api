import express from "express";
import { tryCatchMiddleware } from "./handler.middlewares";
import {
  ExpressRequestExtended,
  ExpressRequestProtectedGroup,
} from "../types/request";
import { ForbiddenError, RequestError } from "../lib/error";
import { chatRoomWhereOrInput } from "../utils/chat/chatRoom.utils";
import { ChatRoom, ChatRoomParticipant } from "../models/chat.models";
import { NotFound } from "../lib/messages";

export const protectChatRoom = (params: string, isGroupChat?: boolean) =>
  tryCatchMiddleware(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const { userId } = req as ExpressRequestExtended;
      const roomId = Number(req.params[params]);
      const uId = Number(userId);

      const room = await ChatRoom.findUnique({
        where: {
          id: roomId,
          isGroupChat,
          OR: chatRoomWhereOrInput(uId),
        },
        select: {
          participants: {
            select: {
              role: true,
              userId: true,
            },
          },
        },
      });

      if (!room) {
        throw new RequestError(NotFound.CHAT_ROOM, 404);
      }

      const participant = await ChatRoomParticipant.findUnique({
        where: {
          chatRoomId_userId: {
            chatRoomId: roomId,
            userId: uId,
          },
        },
      });

      if (!participant) {
        throw new RequestError("You are not participated in this group", 403);
      }

      if (
        !room?.participants.some(
          (user) => user.role !== "user" && user.userId === uId
        )
      ) {
        throw new ForbiddenError();
      }

      (req as ExpressRequestProtectedGroup).userRole = participant.role;
      next();
    }
  );

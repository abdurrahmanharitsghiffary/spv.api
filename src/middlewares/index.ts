import express from "express";
import { ApiError } from "../utils/response";
import { NotFound } from "../lib/messages";
import { ExpressRequestExtended } from "../types/request";
import Chat, { ChatRoom, ChatRoomParticipant } from "../models/chat.models";
import { ForbiddenError, RequestError } from "../lib/error";
import { tryCatchMiddleware } from "./handler.middlewares";
import { chatRoomWhereOrInput } from "../utils/chat/chatRoom.utils";

export default function notFound(req: express.Request, res: express.Response) {
  return res.status(404).json(new ApiError(404, NotFound.ROUTE));
}

export const checkIsParticipatedInChatRoom = ({
  body = "",
  params = "",
  shouldAlsoBlockSendingMessageToGroupChat = false,
}: {
  body?: string;
  params?: string;
  shouldAlsoBlockSendingMessageToGroupChat?: boolean;
}) =>
  tryCatchMiddleware(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const { userId } = req as ExpressRequestExtended;
      const chatRoomId = req.params?.[params] ?? req.body?.[body];
      const UID = Number(userId);
      const CRID = Number(chatRoomId);

      const chatRoom = await ChatRoom.findUnique({
        where: {
          id: CRID,
          OR: chatRoomWhereOrInput(UID),
        },
        select: {
          isGroupChat: true,
          participants: {
            select: {
              userId: true,
            },
            where: {
              userId: UID,
            },
          },
        },
      });

      if (!chatRoom) throw new RequestError(NotFound.CHAT_ROOM, 404);
      console.log("Participant");
      if (chatRoom?.isGroupChat && !shouldAlsoBlockSendingMessageToGroupChat)
        return next();
      if (!chatRoom?.participants?.[0]?.userId) throw new ForbiddenError();

      return next();
    }
  );

export const checkMessageAccess = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { messageId } = req.params;
    const { userId } = req as ExpressRequestExtended;
    const UID = Number(userId);
    const mId = Number(messageId);
    const message = await Chat.findUnique({
      where: { id: mId },
      select: {
        chatRoom: {
          select: {
            participants: {
              where: {
                userId: UID,
              },
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!message?.chatRoom.participants?.[0]?.userId) {
      console.log(message, "Forbiddened");
      throw new ForbiddenError();
    }

    next();
  }
);

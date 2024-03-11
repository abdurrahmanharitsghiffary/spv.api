import express from "express";
import { ApiError } from "../utils/response";
import { NotFound } from "../lib/messages";
import { ExpressRequestExtended } from "../types/request";
import Chat, { ChatRoom } from "../models/chat.models";
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
  shouldAlsoBlockUserRole = false,
}: {
  body?: string;
  params?: string;
  shouldAlsoBlockSendingMessageToGroupChat?: boolean;
  shouldAlsoBlockUserRole?: boolean;
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
          groupVisibility: true,
          isGroupChat: true,
          participants: {
            select: {
              userId: true,
              role: true,
            },
            where: {
              userId: UID,
            },
          },
        },
      });

      if (!chatRoom) throw new RequestError(NotFound.CHAT_ROOM, 404);

      const isPrivateVisibility = chatRoom.groupVisibility === "private";
      const isParticipated = chatRoom?.participants?.[0]?.userId ? true : false;
      const isGroupChat = chatRoom?.isGroupChat ? true : false;

      const isNotParticipatedInGroupChatAndVisibilityIsPrivate =
        !isParticipated && isPrivateVisibility && isGroupChat;
      const isNotParticipatedInPersonalChat = !isParticipated && !isGroupChat;

      const isForbiddenForUser = isParticipated
        ? chatRoom.participants?.[0]?.role === "user" && shouldAlsoBlockUserRole
        : shouldAlsoBlockUserRole;
      const isForbidden =
        isNotParticipatedInGroupChatAndVisibilityIsPrivate ||
        isNotParticipatedInPersonalChat ||
        isForbiddenForUser;

      if (
        isGroupChat &&
        !shouldAlsoBlockSendingMessageToGroupChat &&
        !isForbidden
      )
        return next();
      if (isForbidden) throw new ForbiddenError();

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
            isGroupChat: true,
            groupVisibility: true,
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

    const isParticipated = message?.chatRoom.participants?.[0]?.userId
      ? true
      : false;
    const isGroupChat = message?.chatRoom?.isGroupChat ? true : false;
    const isPrivateVisibility =
      message?.chatRoom?.groupVisibility === "private";

    const isNotParticipatedInGroupChatAndVisibilityIsPrivate =
      !isParticipated && isPrivateVisibility && isGroupChat;
    const isNotParticipatedInPersonalChat = !isParticipated && !isGroupChat;

    const isForbidden =
      isNotParticipatedInGroupChatAndVisibilityIsPrivate ||
      isNotParticipatedInPersonalChat;

    if (isForbidden) {
      throw new ForbiddenError();
    }

    next();
  }
);

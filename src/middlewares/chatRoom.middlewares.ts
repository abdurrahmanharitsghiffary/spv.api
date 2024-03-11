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
import { $Enums } from "@prisma/client";

export const protectChatRoom = (
  params: string,
  isGroupChat?: boolean,
  protectDelete?: boolean
) =>
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

      // if (!participant) {
      // throw new RequestError("You are not participated in this group", 403);
      // }

      const isRole = (
        b: $Enums.ParticipantRole,
        role: $Enums.ParticipantRole
      ) => b === role;

      if (
        !room?.participants.some(
          (user) =>
            (protectDelete
              ? isRole(user.role, "creator") || isRole(user.role, "co_creator")
              : user.role !== "user") && user.userId === uId
        ) ||
        !participant
      ) {
        throw new ForbiddenError();
      }

      (req as ExpressRequestProtectedGroup).userRole = participant.role;
      next();
    }
  );

export const checkGroupVisibility =
  (params: string = "groupId") =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const groupId = Number(req.params?.[params]);
    const { userId } = req as ExpressRequestExtended;
    const uId = Number(userId);

    const participant = await ChatRoomParticipant.findUnique({
      where: { chatRoomId_userId: { chatRoomId: groupId, userId: uId } },
    });
    const isParticipated = participant !== null;
    const group = await ChatRoom.findUnique({
      where: { id: groupId, isGroupChat: true },
      select: { groupVisibility: true },
    });

    if (!group) throw new RequestError(NotFound.GROUP_CHAT, 404);
    if (group.groupVisibility === "private" && !isParticipated)
      throw new ForbiddenError();

    return next();
  };

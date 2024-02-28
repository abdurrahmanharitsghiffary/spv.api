import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { findMessageByRoomId } from "../utils/chat/chat.utils";
import {
  createChatRoom as createChatRoomUts,
  findChatRoomById,
} from "../utils/chat/chatRoom.utils";
import { ApiResponse } from "../utils/response";
import { findParticipantsByRoomId } from "../utils/participants.utils";
import { getPagingObject } from "../utils/paging";
import { emitSocketEvent } from "../socket/socket.utils";
import { Socket_Event } from "../socket/event";
import { ChatRoom } from "../models/chat.models";
import { selectRoomParticipant } from "../lib/query/chat";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import { RequestError } from "../lib/error";
import { NotFound } from "../lib/messages";
import { normalizeChatParticipant } from "../utils/chat/chat.normalize";
import { Socket_Id } from "../lib/consts";

export const createChatRoom = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { participantId } = req.body;

  const createdRoom = await createChatRoomUts({
    participants: [{ id: Number(participantId), role: "admin" }],
    currentUserId: Number(userId),
  });

  createdRoom.participants.forEach((user) => {
    emitSocketEvent(
      req,
      Socket_Id(user.id, "USER"),
      Socket_Event.JOIN_ROOM,
      createdRoom
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(createdRoom, 201, "Chat room created."));
};

export const getChatRoomById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { roomId } = req.params;

  const chatRoom = await findChatRoomById(Number(roomId), Number(userId));

  return res.status(200).json(new ApiResponse(chatRoom, 200));
};

export const getChatRoomParticipantsByRoomId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { roomId } = req.params;
  let { limit = 20, offset = 0 } = req.query;

  limit = Number(limit);
  offset = Number(offset);

  const participants = await findParticipantsByRoomId({
    roomId: Number(roomId),
    currentUserId: Number(userId),
    limit,
    offset,
  });

  return res.status(200).json(
    await getPagingObject({
      req,
      data: participants.data,
      total_records: participants.total,
    })
  );
};

export const getChatRoomMessagesByRoomId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { roomId } = req.params;
  let { limit = 20, offset = 0 } = req.query;

  limit = Number(limit);
  offset = Number(offset);

  const messages = await findMessageByRoomId({
    roomId: Number(roomId),
    currentUserId: Number(userId),
    limit,
    offset,
  });

  return res.status(200).json(
    await getPagingObject({
      req,
      data: messages.data,
      total_records: messages.total,
    })
  );
};

export const getParticipant = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { roomId, participantId } = req.params;
  const rId = Number(roomId);
  const pId = Number(participantId);
  const CUID = Number(userId);
  const room = await ChatRoom.findUnique({
    where: {
      id: rId,
    },
    select: {
      participants: {
        select: {
          ...selectRoomParticipant,
        },
        where: {
          userId: pId,
          user: {
            ...excludeBlockedUser(CUID),
            ...excludeBlockingUser(CUID),
          },
        },
      },
    },
  });

  if (!room) throw new RequestError(NotFound.CHAT_ROOM, 404);
  if (!room.participants?.[0]?.user?.id)
    throw new RequestError(NotFound.USER, 404);

  const normalizedParticipant = await normalizeChatParticipant(
    room.participants?.[0]
  );

  return res.status(200).json(new ApiResponse(normalizedParticipant, 200));
};

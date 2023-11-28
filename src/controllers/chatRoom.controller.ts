import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { findChatByRoomId } from "../utils/chat/chat.utils";
import {
  createChatRoom as createChatRoomUts,
  findChatRoomById,
} from "../utils/chat/chatRoom.utils";
import { ApiResponse } from "../utils/response";
import { ChatRoom } from "../models/chat.models";
import { findParticipantsByRoomId } from "../utils/participants.utils";
import { getPagingObject } from "../utils/paging";
import { emitSocketEvent } from "../socket/socket.utils";
import { Socket_Event } from "../socket/event";

export const createChatRoom = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { participantId } = req.body;

  const createdRoom = await createChatRoomUts({
    participantIds: [Number(participantId)],
    currentUserId: Number(userId),
  });

  createdRoom.participants.users.forEach((user) => {
    emitSocketEvent(
      req,
      user.id.toString(),
      Socket_Event.JOIN_ROOM,
      createdRoom.id
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(createdRoom, 201, "Chat room created."));
};
// TODO INTEGRATE SOCKET EVENT
// CHECK IF API FULLFIL SPEC
export const updateChatRoom = async (
  req: express.Request,
  res: express.Response
) => {
  const { roomId } = req.params;
  const { participants = [], description, title } = req.body;

  const updatedChatRoom = await ChatRoom.update({
    where: {
      id: Number(roomId),
      isGroupChat: true,
    },
    data: {
      description,
      title,
      participants: {
        create: participants.map((id: number) => ({
          user: {
            connect: {
              id,
            },
          },
          role: "user",
        })),
      },
    },
    include: {
      participants: {
        select: { userId: true },
      },
    },
  });

  updatedChatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.userId.toString(),
      Socket_Event.UPDATE_ROOM,
      updatedChatRoom.id
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Chat room successfully updated."));
};

export const deleteChatRoom = async (
  req: express.Request,
  res: express.Response
) => {
  const { roomId } = req.params;

  const deletedRoom = await ChatRoom.delete({
    where: {
      id: Number(roomId),
    },
    include: {
      participants: {
        select: { userId: true },
      },
    },
  });

  deletedRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.userId.toString(),
      Socket_Event.DELETE_ROOM,
      deletedRoom.id
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Chat room successfully deleted."));
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

  const messages = await findChatByRoomId({
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

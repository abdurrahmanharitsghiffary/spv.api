import express from "express";
import { createChatRoom } from "../utils/chat/chatRoom.utils";
import { ExpressRequestExtended } from "../types/request";
import { ApiResponse } from "../utils/response";
import { ChatRoomParticipant } from "../models/chat.models";
import { selectChatRoom } from "../lib/query/chat";
import { selectUserSimplified } from "../lib/query/user";
import { emitSocketEvent } from "../socket/socket.utils";
import { Socket_Event } from "../socket/event";
import { normalizeChatRooms } from "../utils/chat/chatRoom.normalize";
import { RequestError } from "../lib/error";

export const createGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { participants } = req.body;

  const createdGroupChat = await createChatRoom({
    isGroupChat: true,
    participantIds: participants,
    currentUserId: Number(userId),
  });

  createdGroupChat.participants.users.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.id.toString(),
      Socket_Event.CREATE_ROOM,
      createdGroupChat
    );
  });

  return res
    .status(201)
    .json(
      new ApiResponse(createdGroupChat, 201, "Group chat created successfully.")
    );
};

export const joinGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;
  const { userId } = req as ExpressRequestExtended;

  const joinedRoom = await ChatRoomParticipant.create({
    data: {
      chatRoomId: Number(groupId),
      userId: Number(userId),
      role: "user",
    },
    select: {
      role: true,
      user: {
        select: selectUserSimplified,
      },
      chatRoomId: true,
      createdAt: true,
      chatRoom: { select: selectChatRoom },
    },
  });

  joinedRoom.chatRoom.participants.forEach(async (participant) => {
    const normalizedRoom = await normalizeChatRooms(joinedRoom.chatRoom);

    emitSocketEvent(
      req,
      participant.user.id.toString(),
      Socket_Event.JOIN_ROOM,
      normalizedRoom
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Group chat joined successfully."));
};

export const leaveGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;
  const { userId } = req as ExpressRequestExtended;

  const paticipatedMember = await ChatRoomParticipant.findFirst({
    where: {
      userId: Number(userId),
      chatRoomId: Number(groupId),
    },
  });

  if (!paticipatedMember) {
    throw new RequestError("You are not participated in group.", 409);
  }

  const joinedRoom = await ChatRoomParticipant.delete({
    where: {
      id: paticipatedMember.id,
    },
    select: {
      role: true,
      user: {
        select: selectUserSimplified,
      },
      chatRoomId: true,
      createdAt: true,
      chatRoom: { select: selectChatRoom },
    },
  });

  joinedRoom.chatRoom.participants.forEach(async (participant) => {
    const normalizedRoom = await normalizeChatRooms(joinedRoom.chatRoom);

    emitSocketEvent(
      req,
      participant.user.id.toString(),
      Socket_Event.JOIN_ROOM,
      normalizedRoom
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Successfully leave group chat."));
};

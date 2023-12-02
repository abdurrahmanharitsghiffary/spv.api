import express from "express";
import { createChatRoom, findChatRoomById } from "../utils/chat/chatRoom.utils";
import { ExpressRequestExtended } from "../types/request";
import { ApiResponse } from "../utils/response";
import { ChatRoom, ChatRoomParticipant } from "../models/chat.models";
import { selectChatRoom } from "../lib/query/chat";
import { selectUserSimplified } from "../lib/query/user";
import { emitSocketEvent } from "../socket/socket.utils";
import { Socket_Event } from "../socket/event";
import { normalizeChatRooms } from "../utils/chat/chatRoom.normalize";
import { RequestError } from "../lib/error";
import Image from "../models/image.models";
import { deleteUploadedImage, getFileDest } from "../utils";

export const createGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { participants, description, title } = req.body;
  const image = req.file;

  const createdGroupChat = await createChatRoom({
    isGroupChat: true,
    participantIds: participants,
    currentUserId: Number(userId),
    description,
    title,
    image,
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

  await findChatRoomById(Number(groupId), Number(userId), {
    message: "Group chat not found.",
    statusCode: 404,
  });

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

export const updateGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;
  const image = req.file;
  const { participants = [], description, title, admin } = req.body;

  const updatedChatRoom = await ChatRoom.update({
    where: {
      id: Number(groupId),
      isGroupChat: true,
    },
    data: {
      description,
      title,
      participants: {
        create: [
          ...participants.map((id: number) => ({
            user: {
              connect: {
                id,
              },
            },
            role: "user",
          })),
          ...admin.map((id: number) => ({
            user: {
              connect: {
                id,
              },
            },
            role: "admin",
          })),
        ],
      },
    },
    include: {
      participants: {
        select: { userId: true },
      },
      groupPicture: {
        select: {
          id: true,
          src: true,
        },
      },
    },
  });

  if (image) {
    await Image.upsert({
      create: {
        src: getFileDest(image) as string,
        groupId: updatedChatRoom.id,
      },
      where: {
        id: updatedChatRoom.groupPicture?.id,
      },
      update: {
        src: getFileDest(image) as string,
      },
    });

    if (updatedChatRoom.groupPicture?.src) {
      await deleteUploadedImage(updatedChatRoom.groupPicture.src);
    }
  }

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

export const deleteGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { groupId } = req.params;

  const deletedRoom = await ChatRoom.delete({
    where: {
      id: Number(groupId),
      isGroupChat: true,
    },
    include: {
      participants: {
        select: { userId: true },
      },
      groupPicture: {
        select: {
          src: true,
        },
      },
    },
  });

  if (deletedRoom.groupPicture?.src) {
    await deleteUploadedImage(deletedRoom.groupPicture.src);
  }

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

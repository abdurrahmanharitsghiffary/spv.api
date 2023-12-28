import express from "express";
import { createChatRoom, findChatRoomById } from "../utils/chat/chatRoom.utils";
import {
  ExpressRequestExtended,
  ExpressRequestProtectedGroup,
} from "../types/request";
import { ApiResponse } from "../utils/response";
import { ChatRoom, ChatRoomParticipant } from "../models/chat.models";
import {
  selectChatRoom,
  selectChatRoomPWL,
  selectRoomParticipant,
} from "../lib/query/chat";
import { selectUserSimplified } from "../lib/query/user";
import { emitSocketEvent } from "../socket/socket.utils";
import { Socket_Event } from "../socket/event";
import { normalizeChatRooms } from "../utils/chat/chatRoom.normalize";
import { RequestError } from "../lib/error";
import Image from "../models/image.models";
import { checkParticipants, deleteUploadedImage, getFileDest } from "../utils";
import { ParticipantsField } from "../types/chat";
import { NotFound } from "../lib/messages";
import { normalizeChatParticipant } from "../utils/chat/chat.normalize";
import { Socket_Id } from "../lib/consts";

export const createGroupChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { participants, description, title } = req.body;
  const image = req.file;

  const createdGroupChat = await createChatRoom({
    isGroupChat: true,
    participants: participants,
    currentUserId: Number(userId),
    description,
    title,
    image,
  });

  createdGroupChat.participants.users.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.id, "USER"),
      Socket_Event.JOIN_ROOM,
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
  const gId = Number(groupId);
  const uId = Number(userId);

  await findChatRoomById(gId, uId, {
    message: NotFound.GROUP_CHAT,
    statusCode: 404,
  });

  const participant = await ChatRoomParticipant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId: gId,
        userId: uId,
      },
    },
  });

  if (participant) {
    throw new RequestError("You already participated in the group.", 400);
  }

  const joinedRoom = await ChatRoomParticipant.create({
    data: {
      chatRoomId: gId,
      userId: uId,
      role: "user",
    },
    select: {
      role: true,
      user: {
        select: selectUserSimplified,
      },
      chatRoomId: true,
      createdAt: true,
      chatRoom: { select: selectChatRoomPWL(uId) },
    },
  });

  joinedRoom.chatRoom.participants.forEach(async (participant) => {
    const normalizedRoom = await normalizeChatRooms(joinedRoom.chatRoom);

    emitSocketEvent(
      req,
      Socket_Id(participant.user.id, "USER"),
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
  const gId = Number(groupId);
  const uId = Number(userId);

  const group = await ChatRoom.findUnique({ where: { id: gId } });

  if (!group) throw new RequestError(NotFound.GROUP_CHAT, 404);

  const paticipatedMember = await ChatRoomParticipant.findUnique({
    where: {
      chatRoomId_userId: {
        userId: uId,
        chatRoomId: gId,
      },
    },
  });

  if (!paticipatedMember) {
    throw new RequestError("You are not participated in group.", 409);
  }

  const joinedRoom = await ChatRoomParticipant.delete({
    where: {
      chatRoomId_userId: {
        userId: paticipatedMember.userId,
        chatRoomId: gId,
      },
    },
    select: {
      role: true,
      user: {
        select: selectUserSimplified,
      },
      chatRoomId: true,
      createdAt: true,
      chatRoom: { select: selectChatRoomPWL(uId) },
    },
  });

  joinedRoom.chatRoom.participants.forEach(async (participant) => {
    const normalizedRoom = await normalizeChatRooms(joinedRoom.chatRoom);

    emitSocketEvent(
      req,
      Socket_Id(participant.user.id, "USER"),
      Socket_Event.LEAVE_ROOM,
      normalizedRoom.id
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
  const { userId } = req as ExpressRequestExtended;
  const { groupId } = req.params;
  const image = req.file;
  const { userRole } = req as ExpressRequestProtectedGroup;
  let { participants = [], description, title } = req.body;
  const gId = Number(groupId);
  participants = participants.map((p: any) => ({ ...p, id: Number(p.id) }));
  await checkParticipants(participants, gId, userRole);

  const updatedChatRoom = await ChatRoom.update({
    where: {
      id: gId,
      isGroupChat: true,
    },
    data: {
      description,
      title,
      participants: {
        upsert: [
          ...(participants as ParticipantsField).map((item) => ({
            create: {
              role: item.role,
              userId: item.id,
            },
            update: {
              role: item.role,
            },
            where: {
              chatRoomId_userId: {
                chatRoomId: gId,
                userId: item.id,
              },
            },
          })),
        ],
      },
    },
    select: { ...selectChatRoomPWL(Number(userId)) },
  });

  if (image) {
    await Image.upsert({
      create: {
        src: getFileDest(image) as string,
        groupId: updatedChatRoom.id,
      },
      where: {
        groupId: updatedChatRoom.id,
      },
      update: {
        src: getFileDest(image) as string,
      },
    });

    if (updatedChatRoom.groupPicture?.src) {
      await deleteUploadedImage(updatedChatRoom.groupPicture.src);
    }
  }

  const normalizedRoom = await normalizeChatRooms(updatedChatRoom);

  updatedChatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.user.id, "USER"),
      Socket_Event.UPDATE_ROOM,
      {
        updating: "details",
        data: normalizedRoom,
      }
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
      Socket_Id(participant.userId, "USER"),
      Socket_Event.DELETE_ROOM,
      deletedRoom.id
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Chat room successfully deleted."));
};

export const updateGroupChatParticipants = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { roomId } = req.params;
  const { participants } = req.body;
  const { userRole } = req as ExpressRequestProtectedGroup;
  const rId = Number(roomId);

  await checkParticipants(participants, rId, userRole);

  const updatedGroupChat = await ChatRoom.update({
    where: {
      id: rId,
    },
    data: {
      participants: {
        upsert: [
          ...(participants as ParticipantsField).map((item) => ({
            create: {
              role: item.role,
              userId: item.id,
            },
            update: {
              role: item.role,
            },
            where: {
              chatRoomId_userId: {
                chatRoomId: rId,
                userId: item.id,
              },
            },
          })),
        ],
      },
    },
    select: {
      participants: {
        select: {
          ...selectRoomParticipant,
        },
      },
    },
  });

  const normalizedParticipants = await Promise.all(
    updatedGroupChat.participants.map((participant) =>
      Promise.resolve(normalizeChatParticipant(participant))
    )
  );

  updatedGroupChat.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.user.id, "USER"),
      Socket_Event.UPDATE_ROOM,
      {
        updating: "participants",
        data: normalizedParticipants,
      }
    );
  });

  return res
    .status(204)
    .json(
      new ApiResponse(
        null,
        204,
        "Participants successfully added into the group."
      )
    );
};

export const deleteGroupParticipants = async (
  req: express.Request,
  res: express.Response
) => {
  const { roomId } = req.params;
  const { userRole, userId } = req as ExpressRequestProtectedGroup &
    ExpressRequestExtended;
  const { ids } = req.body;
  const rId = Number(roomId);

  await checkParticipants(ids, rId, userRole, true);

  const chatRoomAfterDeletingParticipants = await ChatRoom.update({
    where: {
      id: rId,
    },
    data: {
      participants: {
        deleteMany: [...(ids as number[]).map((id) => ({ userId: id }))],
      },
    },
    select: {
      participants: {
        select: {
          userId: true,
        },
      },
    },
  });

  chatRoomAfterDeletingParticipants.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      Socket_Id(participant.userId, "USER"),
      Socket_Event.UPDATE_ROOM,
      chatRoomAfterDeletingParticipants.participants.map((p) => p.userId)
    );
  });

  return res
    .status(204)
    .json(
      new ApiResponse(
        null,
        204,
        "Participants successfully removed from the group."
      )
    );
};

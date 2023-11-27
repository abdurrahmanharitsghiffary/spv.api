import express from "express";
import { ExpressRequestExtended } from "../types/request";
import {
  findAllUserChat,
  findChatByParticipantIds,
  findChatRoomById,
} from "../utils/chat/chat.utils";
import {
  deleteChatById as deleteChatWithId,
  updateChatById as updateChatWithId,
  createChatWithRoomIdAndAuthorId,
} from "../utils/chat/chat.utils";
import { getPagingObject } from "../utils/paging";
import Image from "../models/image.models";
import { getFileDest } from "../utils";
import { ApiResponse } from "../utils/response";
import { emitSocketEvent } from "../socket/socket.utils";
import { findUserById } from "../utils/user/user.utils";
import { normalizeChat } from "../utils/chat/chat.normalize";

export const getChatsByRecipientId = async (
  req: express.Request,
  res: express.Response
) => {
  const { recipientId } = req.params;

  let { limit = 20, offset = 0 } = req.query;
  limit = Number(limit);
  offset = Number(offset);
  const { userId } = req as ExpressRequestExtended;

  const chats = await findChatByParticipantIds({
    currentUserId: Number(userId),
    participantsId: [Number(recipientId)],
    limit,
    offset,
  });

  return res.status(200).json(
    await getPagingObject({
      data: chats.data,
      req,
      total_records: chats.total,
    })
  );
};

export const getAllChatsByUserId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { limit = 20, offset = 0 } = req.query;

  const rooms = await findAllUserChat({
    userId: Number(userId),
    limit: Number(limit),
    offset: Number(offset),
  });

  return res.status(200).json(
    await getPagingObject({
      data: rooms.data,
      total_records: rooms.total,
      req,
    })
  );
};

export const deleteChatById = async (
  req: express.Request,
  res: express.Response
) => {
  const { messageId } = req.params;

  const deletedChat = await deleteChatWithId(Number(messageId));

  deletedChat.chatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.userId.toString(),
      "deleteMessage",
      deletedChat
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Chat successfully deleted."));
};

export const updateChatById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { messageId } = req.params;
  const { message } = req.body;

  const updatedChat = await updateChatWithId(
    Number(messageId),
    message,
    Number(userId)
  );

  updatedChat.chatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.userId.toString(),
      "updateMessage",
      updatedChat
    );
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Chat successfully updated."));
};

export const createChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { message, chatRoomId } = req.body;

  const image = req.file ?? null;

  await findChatRoomById(Number(chatRoomId), Number(userId));

  const createdChat = await createChatWithRoomIdAndAuthorId({
    senderId: Number(userId),
    message,
    chatRoomId,
  });

  if (image) {
    await Image.create({
      data: {
        chatId: createdChat.id,
        src: getFileDest(image) as string,
      },
    });
  }

  createdChat.chatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.userId.toString(),
      "receiveMessage",
      createdChat
    );
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        normalizeChat(createdChat),
        201,
        "Chat successfully created."
      )
    );
};

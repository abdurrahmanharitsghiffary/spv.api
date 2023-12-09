import express from "express";
import { ExpressRequestExtended } from "../types/request";
import {
  deleteChatById as deleteChatWithId,
  updateChatById as updateChatWithId,
  createChatWithRoomIdAndAuthorId,
} from "../utils/chat/chat.utils";
import { getPagingObject } from "../utils/paging";
import Image from "../models/image.models";
import { deleteUploadedImage, getFileDest } from "../utils";
import { ApiResponse } from "../utils/response";
import { emitSocketEvent } from "../socket/socket.utils";
import { normalizeChat } from "../utils/chat/chat.normalize";
import { Socket_Event } from "../socket/event";
import {
  findAllUserChatRoom,
  findChatRoomById,
} from "../utils/chat/chatRoom.utils";

export const getAllChatsByUserId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { limit = 20, offset = 0, type = "all" } = req.query;

  const rooms = await findAllUserChatRoom({
    userId: Number(userId),
    limit: Number(limit),
    offset: Number(offset),
    type: type as any,
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
  const { userId } = req as ExpressRequestExtended;
  const { messageId } = req.params;

  const deletedChat = await deleteChatWithId(Number(messageId), Number(userId));
  const normalizedChat = await normalizeChat(deletedChat);

  deletedChat.chatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.userId.toString(),
      Socket_Event.DELETE_MESSAGE,
      normalizedChat
    );
  });

  if (deletedChat.chatImage && deletedChat.chatImage.length > 0) {
    deletedChat.chatImage.forEach(async (image) => {
      await deleteUploadedImage(image.src);
    });
  }

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
    Number(userId),
    message
  );

  const normalizedChat = await normalizeChat(updatedChat);

  updatedChat.chatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.userId.toString(),
      Socket_Event.UPDATE_MESSAGE,
      normalizedChat
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
  const cRId = Number(chatRoomId);
  const uId = Number(userId);
  const images = (req.files as Express.Multer.File[]) ?? [];
  console.log(images, "Images");
  await findChatRoomById(cRId, uId);

  const createdChat = await createChatWithRoomIdAndAuthorId({
    senderId: uId,
    message,
    chatRoomId: cRId,
    images,
  });

  const normalizedChat = await normalizeChat(createdChat);

  createdChat.chatRoom.participants.forEach((participant) => {
    emitSocketEvent(
      req,
      participant.userId.toString(),
      Socket_Event.RECEIVE_MESSAGE,
      normalizedChat
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(normalizedChat, 201, "Chat successfully created."));
};

import express from "express";
import { ExpressRequestExtended } from "../types/request";
import {
  findChatBySenderAndRecipientId,
  findAllChatByUserId,
} from "../utils/findChat";
import {
  deleteChatById as deleteChatWithId,
  updateChatById as updateChatWithId,
  createChatWithSenderIdAndRecipientId,
} from "../models/chat";
import { getPagingObject } from "../utils/getPagingObject";
import Image from "../models/image";
import { getFileDest } from "../utils/getFileDest";
import { findUserById } from "../utils/findUser";
import { jSuccess } from "../utils/jsend";

export const getChatsByRecipientId = async (
  req: express.Request,
  res: express.Response
) => {
  const { recipientId } = req.params;

  await findUserById(recipientId);

  let { limit = 20, offset = 0 } = req.query;
  limit = Number(limit);
  offset = Number(offset);
  const { userId } = req as ExpressRequestExtended;

  const chats = await findChatBySenderAndRecipientId({
    userId: Number(userId),
    recipientId: Number(recipientId),
    limit,
    offset,
  });

  return res.status(200).json(
    getPagingObject({
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

  const chats = await findAllChatByUserId({
    userId: Number(userId),
    limit: Number(limit),
    offset: Number(offset),
    currentUserId: Number(userId),
  });

  return res.status(200).json(
    getPagingObject({
      data: chats.data,
      total_records: chats.total,
      req,
    })
  );
};

export const deleteChatById = async (
  req: express.Request,
  res: express.Response
) => {
  const { chatId } = req.params;

  await deleteChatWithId(Number(chatId));

  return res.status(204).json(jSuccess(null));
};

export const updateChatById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { chatId } = req.params;
  const { message } = req.body;

  await updateChatWithId(Number(chatId), message, Number(userId));

  return res.status(204).json(jSuccess(null));
};

export const createChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { recipientId, message } = req.body;

  const image = req.file ?? null;

  const createdChat = await createChatWithSenderIdAndRecipientId({
    senderId: Number(userId),
    receiverId: Number(recipientId),
    message,
  });

  if (image) {
    await Image.create({
      data: {
        chatId: createdChat.id,
        src: getFileDest(image) as string,
      },
    });
  }

  return res.status(201).json(jSuccess(createdChat));
};

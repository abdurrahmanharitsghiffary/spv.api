import express from "express";
import { ExpressRequestExtended } from "../types/request";
import {
  findChatBySenderAndRecipientId,
  deleteChatById as deleteChatWithId,
  updateChatById as updateChatWithId,
  createChatWithSenderIdAndRecipientId,
  findAllChatByUserId,
} from "../utils/findChat";
import { getPagingObject } from "../utils/getPagingObject";
import Image from "../models/image";
import { getFileDest } from "../utils/getFileDest";
import { findUserById } from "../utils/findUser";
import { missingFieldsErrorTrigger } from "../lib/error";
import { baseUrl } from "../lib/baseUrl";

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
      data: chats,
      dataKey: "chats",
      path: `${baseUrl}/api/chats/${recipientId}`,
      limit,
      offset,
    })
  );
};

export const deleteChatById = async (
  req: express.Request,
  res: express.Response
) => {
  const { chatId } = req.params;

  await deleteChatWithId(Number(chatId));

  return res.status(204).json();
};

export const updateChatById = async (
  req: express.Request,
  res: express.Response
) => {
  const { chatId } = req.params;
  const { message } = req.body;
  missingFieldsErrorTrigger([{ field: message, key: "message" }]);

  await updateChatWithId(Number(chatId), message);

  return res.status(204).json();
};

export const createChat = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { recipientId, message } = req.body;
  missingFieldsErrorTrigger([
    { field: message, key: "message" },
    { field: recipientId, key: "recipientId" },
  ]);

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

  return res.status(201).json();
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
  });

  return res.status(200).json(
    getPagingObject({
      data: chats,
      path: `${baseUrl}/api/me/chats`,
      dataKey: "chats",
      limit: Number(limit),
      offset: Number(offset),
    })
  );
};

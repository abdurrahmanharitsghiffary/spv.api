import { Prisma } from "@prisma/client";
import { RequestError, limitErrorTrigger } from "../lib/error";
import { selectChat } from "../lib/query/chat";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import Chat from "../models/chat";
import { normalizeChat } from "./normalizeChat";

const chatWhereAndInput = (currentUserId?: number) =>
  [
    {
      recipient: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
  ] satisfies Prisma.ChatWhereInput["AND"];

export const findChatById = async (chatId: number, currentUserId?: number) => {
  const chat = await Chat.findUnique({
    where: {
      id: chatId,
      AND: chatWhereAndInput(currentUserId),
    },
    select: selectChat,
  });

  if (!chat) throw new RequestError("Chat not found", 404);

  return normalizeChat(chat);
};

export const findChatBySenderAndRecipientId = async ({
  recipientId,
  userId,
  limit,
  offset,
}: {
  userId: number;
  recipientId: number;
  limit?: number;
  offset?: number;
}) => {
  const chats = await Chat.findMany({
    where: {
      authorId: userId,
      recipientId: recipientId,
      AND: chatWhereAndInput(userId),
    },
    orderBy: { createdAt: "desc" },
    select: selectChat,
    take: limit ?? 20,
    skip: offset ?? 0,
  });

  const totalChats = await Chat.count({
    where: {
      authorId: userId,
      recipientId: recipientId,
      AND: chatWhereAndInput(userId),
    },
  });

  return { data: chats.map((chat) => normalizeChat(chat)), total: totalChats };
};

export const findAllChatByUserId = async ({
  limit = 20,
  offset = 0,
  userId,
  currentUserId,
}: {
  limit?: number;
  offset?: number;
  userId: number;
  currentUserId?: number;
}) => {
  const chats = await Chat.findMany({
    where: {
      authorId: userId,
      AND: chatWhereAndInput(currentUserId),
    },
    skip: offset,
    take: limit,
    select: selectChat,
    orderBy: { createdAt: "desc" },
    distinct: ["recipientId"],
  });

  const totalChats = await Chat.count({
    where: {
      authorId: userId,
      AND: chatWhereAndInput(currentUserId),
    },
    distinct: ["recipientId"],
  });

  return {
    data: chats.map((chat) => normalizeChat(chat)),
    total: totalChats,
  };
};

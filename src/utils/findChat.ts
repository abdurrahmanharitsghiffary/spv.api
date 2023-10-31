import { RequestError, limitErrorTrigger } from "../lib/error";
import { selectChat } from "../lib/query/chat";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import Chat from "../models/chat";
import { normalizeChat } from "./normalizeChat";

export const findChatById = async (chatId: number, currentUserId?: number) => {
  const chat = await Chat.findUnique({
    where: {
      id: chatId,
      recipient: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
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
    },
    select: selectChat,
    take: limit ?? 20,
    skip: offset ?? 0,
  });

  const totalChats = await Chat.count({
    where: {
      authorId: userId,
      recipientId: recipientId,
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
      recipient: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
    skip: offset,
    take: limit,
    select: selectChat,
    distinct: ["recipientId"],
  });

  // changes here
  const totalChats = await Chat.count({
    where: {
      authorId: userId,
      recipient: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
    distinct: ["recipientId"],
  });

  return {
    data: chats.map((chat) => normalizeChat(chat)),
    total: totalChats,
  };
};

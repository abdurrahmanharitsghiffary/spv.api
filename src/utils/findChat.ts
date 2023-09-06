import { RequestError, limitErrorTrigger } from "../lib/error";
import { selectChat } from "../lib/query/chat";
import Chat from "../models/chat";
import Image from "../models/image";
import { normalizeChat } from "./normalizeChat";

export const findChatById = async (chatId: number) => {
  const chat = await Chat.findUnique({
    where: {
      id: chatId,
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

  return chats.map((chat) => normalizeChat(chat));
};

export const createChatWithSenderIdAndRecipientId = async (createOptions: {
  receiverId: number;
  senderId: number;
  message: string;
  imageSrc?: string;
}) => {
  const { receiverId, senderId, message } = createOptions;

  const createdChat = await Chat.create({
    data: {
      authorId: senderId,
      recipientId: receiverId,
      message,
    },
    select: selectChat,
  });

  if (createOptions?.imageSrc) {
    await Image.create({
      data: {
        chatId: createdChat.id,
        src: createOptions.imageSrc,
      },
    });
  }

  return normalizeChat(createdChat);
};

export const deleteChatById = async (chatId: number) => {
  await findChatById(chatId);

  await Chat.delete({
    where: {
      id: chatId,
    },
  });
};

export const updateChatById = async (chatId: number, message?: string) => {
  await findChatById(chatId);

  await Chat.update({
    where: {
      id: chatId,
    },
    data: {
      message,
    },
  });
};

export const findAllChatByUserId = async ({
  limit = 20,
  offset = 0,
  userId,
}: {
  limit?: number;
  offset?: number;
  userId: number;
}) => {
  const chats = await Chat.findMany({
    where: {
      authorId: userId,
    },
    skip: offset,
    take: limit,
    select: selectChat,
    distinct: ["recipientId"],
  });

  return chats.map((chat) => normalizeChat(chat));
};

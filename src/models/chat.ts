import prisma from "../config/prismaClient";
import { selectChat } from "../lib/query/chat";
import { findChatById } from "../utils/findChat";
import { normalizeChat } from "../utils/normalizeChat";
const Chat = prisma.chat;

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
    await prisma.image.create({
      data: {
        chatId: createdChat.id,
        src: createOptions.imageSrc,
      },
    });
  }

  return normalizeChat(createdChat);
};

export const deleteChatById = async (
  chatId: number,
  currentUserId?: number
) => {
  await findChatById(chatId, currentUserId);
  await Chat.delete({
    where: {
      id: chatId,
    },
  });
};

export const updateChatById = async (
  chatId: number,
  message?: string,
  currentUserId?: number
) => {
  await findChatById(chatId, currentUserId);
  await Chat.update({
    where: {
      id: chatId,
    },
    data: {
      message,
    },
  });
};

export default Chat;

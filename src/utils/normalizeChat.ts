import { baseUrl } from "../lib/baseUrl";
import { SelectChatPayload } from "../lib/query/chat";
import { Chat } from "../types/chat";

export const normalizeChat = (chat: SelectChatPayload): Chat => {
  console.log(chat);
  const normalizedChat: Chat = {
    id: chat.id,
    message: chat.message,
    image: null,
    author: {
      id: chat.author.id,
      firstName: chat.author.firstName,
      lastName: chat.author.lastName,
      username: chat.author.username,
      image: chat.author.profile?.avatarImage,
    },
    recipient: {
      id: chat.recipient.id,
      firstName: chat.recipient.firstName,
      lastName: chat.recipient.lastName,
      username: chat.recipient.username,
      image: chat.recipient.profile?.avatarImage,
    },
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };

  if (normalizedChat?.author?.image)
    normalizedChat.author.image = {
      src: new URL(normalizedChat.author.image.src, baseUrl).href,
    };

  if (normalizedChat?.recipient?.image)
    normalizedChat.recipient.image = {
      src: new URL(normalizedChat.recipient.image.src, baseUrl).href,
    };

  if (chat?.chatImage) {
    normalizedChat.image = { src: new URL(chat.chatImage?.src, baseUrl).href };
  }

  return normalizedChat;
};

import { SelectChatPayload } from "../lib/query/chat";
import { Chat } from "../types/chat";

export const normalizeChat = (chat: SelectChatPayload) => {
  const normalizedChat: Chat = {
    id: chat.id,
    message: chat.message,
    image: chat.chatImage,
    sender: chat.author,
    receiver: chat.recipient,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };

  return normalizedChat;
};

import { SelectChatPayload } from "../lib/query/chat";
import { Chat } from "../types/chat";

export const normalizeChat = (chat: SelectChatPayload): Chat => {
  const normalizedChat: Chat = {
    id: chat.id,
    message: chat.message,
    image: chat.chatImage,
    author: {
      id: chat.author.id,
      username: chat.author.username,
      image: chat.author.profile?.avatarImage,
    },
    recipient: {
      id: chat.recipient.id,
      username: chat.recipient.username,
      image: chat.recipient.profile?.avatarImage,
    },
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };

  return normalizedChat;
};

// export const normalizeChat = (chat: SelectChatPayload) => {
//   const normalizedChat: Chat = {
//     id: chat.id,
//     message: chat.message,
//     image: chat.chatImage,
//     author: {
//       id: chat.author.id,
//       username: chat.author.username,
//       image: chat.author.profile?.avatarImage?.src ?{src:chat.author.profile?.avatarImage.src} : null,
//     },
//     recipient: {
//       id: chat.recipient.id,
//       username: chat.recipient.username,
//       image: chat.recipient.profile?.avatarImage?.src ? {src:chat.recipient.profile?.avatarImage?.src}: null ,
//     },
//     createdAt: chat.createdAt,
//     updatedAt: chat.updatedAt,
//   };

//   return normalizedChat;
// };

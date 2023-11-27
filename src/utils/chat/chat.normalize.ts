import { getCompleteFileUrlPath } from "..";
import {
  ChatRoomParticipantPayload,
  SelectChatPayload,
  SelectChatRoomPayload,
} from "../../lib/query/chat";
import { Chat, ChatRoom, ChatRoomParticipant } from "../../types/chat";

export const normalizeChat = (chat: SelectChatPayload): Chat => {
  const normalizedChat: Chat = {
    id: chat.id,
    message: chat.message,
    attachments: getCompleteFileUrlPath(chat.chatImage),
    author: {
      id: chat.author.id,
      fullName: chat.author.fullName,
      isOnline: chat.author.isOnline,
      firstName: chat.author.firstName,
      lastName: chat.author.lastName,
      username: chat.author.username,
      avatarImage: getCompleteFileUrlPath(chat.author.profile?.avatarImage),
    } as any,
    recipient: {
      id: chat.recipient.id,
      fullName: chat.recipient.fullName,
      isOnline: chat.recipient.isOnline,
      firstName: chat.recipient.firstName,
      lastName: chat.recipient.lastName,
      username: chat.recipient.username,
      avatarImage: getCompleteFileUrlPath(chat.recipient.profile?.avatarImage),
    } as any,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
  };

  // if (normalizedChat?.author?.avatarImage)
  //   normalizedChat.author.avatarImage = {
  //     src: new URL(normalizedChat.author.avatarImage.src, BASE_URL).href,
  //   };

  // if (normalizedChat?.recipient?.avatarImage)
  //   normalizedChat.recipient.avatarImage = {
  //     src: new URL(normalizedChat.recipient.avatarImage.src, BASE_URL).href,
  //   };

  // if (chat?.chatImage) {
  //   normalizedChat.attachments = {
  //     src: new URL(chat.chatImage?.src, BASE_URL).href,
  //   };
  // }

  return normalizedChat;
};

export const normalizeChatRooms = (room: SelectChatRoomPayload): ChatRoom => {
  return {
    createdAt: room.createdAt,
    id: room.id,
    isGroupChat: room.isGroupChat,
    messages: room.messages.map((message) => normalizeChat(message)),
    unreadMessages: { total: room._count.messages },
    updatedAt: room.updatedAt,
    description: room.description,
    title: room.title,
    participants: {
      users: room.participants.map((participant) =>
        normalizeChatParticipant(participant)
      ),
      total: room._count.participants,
    },
  };
};

export const normalizeChatParticipant = (
  payload: ChatRoomParticipantPayload
): ChatRoomParticipant => ({
  avatarImage: payload.user.profile?.avatarImage,
  firstName: payload.user.firstName,
  lastName: payload.user.lastName,
  fullName: payload.user.fullName,
  id: payload.user.id,
  isOnline: payload.user.isOnline,
  joinedAt: payload.createdAt,
  role: payload.role,
  username: payload.user.username,
});

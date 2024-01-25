import {
  ChatRoomParticipantPayload,
  SelectChatPayload,
} from "../../lib/query/chat";
import { Chat, ChatRoomParticipant } from "../../types/chat";

export const normalizeChat = (chat: SelectChatPayload): Promise<Chat> =>
  new Promise((resolve) => {
    const normalizedChat: Chat = {
      id: chat.id,
      message: chat.message,
      attachments: chat.chatImage ?? [],
      readedBy: chat.readedBy.map((read) => ({
        avatarImage: read.user.profile?.avatarImage,
        firstName: read.user.firstName,
        fullName: read.user.fullName,
        lastName: read.user.lastName,
        id: read.user.id,
        isOnline: read.user.isOnline,
        readedAt: read.createdAt,
        username: read.user.username,
      })),
      isGroupChat: chat.chatRoom.isGroupChat,
      author: {
        id: chat.author.id,
        fullName: chat.author.fullName,
        isOnline: chat.author.isOnline,
        firstName: chat.author.firstName,
        lastName: chat.author.lastName,
        username: chat.author.username,
        avatarImage: chat.author.profile?.avatarImage,
      } as any,
      roomId: chat.chatRoomId,
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

    return resolve(normalizedChat);
  });

export const normalizeChatParticipant = (
  payload: ChatRoomParticipantPayload
): Promise<ChatRoomParticipant> =>
  new Promise((resolve) =>
    resolve({
      avatarImage: payload.user.profile?.avatarImage,
      firstName: payload.user.firstName,
      roomId: payload.chatRoomId,
      lastName: payload.user.lastName,
      fullName: payload.user.fullName,
      id: payload.user.id,
      isOnline: payload.user.isOnline,
      joinedAt: payload.createdAt,
      role: payload.role,
      username: payload.user.username,
    })
  );

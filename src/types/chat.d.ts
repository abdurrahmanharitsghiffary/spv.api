import { $Enums } from "@prisma/client";
import { Image } from "./profile";
import { UserSimplified } from "./user";

export type Chat = {
  id: number;
  message: string | null;
  attachments: Image;
  author: UserSimplified;
  roomId: number;
  createdAt: Date;
  updatedAt: Date;
};

type UndreadMessageSimplified = {
  total: number;
};

type UndreadMessage = {
  total: number;
} & UndreadMessageSimplified;

type LastChat = {
  user: UserSimplified;
  chat: ChatT;
  unreadMessages: UndreadMessage;
};

type ChatRoomParticipant = UserSimplified & {
  role: $Enums.ParticipantRole;
  joinedAt: Date;
};

type ChatRoom = {
  id: number;
  participants: { users: ChatRoomParticipant[]; total: number };
  messages: Chat[];
  unreadMessages: UndreadMessageSimplified;
  description?: string | null;
  title?: string | null;
  isGroupChat: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatRoomPayload = {
  isGroupChat: boolean;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    messages: number;
  };
  description: string | null;
  title: string | null;
  participants: {
    role: $Enums.ParticipantRole;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      fullName: string | null;
      username: string;
      isOnline: boolean;
      profile: {
        avatarImage: {
          id: number;
          src: string;
          postId: number | null;
          profileId: number | null;
          commentId: number | null;
          chatId: number | null;
          createdAt: Date;
          updatedAt: Date;
        } | null;
      } | null;
    };
  }[];
  messages: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    message: string | null;
    chatImage: {
      id: number;
      src: string;
    } | null;
    author: {
      id: number;
      firstName: string;
      lastName: string;
      fullName: string | null;
      username: string;
      isOnline: boolean;
      profile: {
        avatarImage: {
          src: string;
        } | null;
      } | null;
    };
    recipient: {
      id: number;
      firstName: string;
      lastName: string;
      fullName: string | null;
      username: string;
      isOnline: boolean;
      profile: {
        avatarImage: {
          src: string;
        } | null;
      } | null;
    };
  }[];
};

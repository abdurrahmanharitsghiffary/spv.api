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

type ChatRoomParticipant = UserSimplified & {
  role: $Enums.ParticipantRole;
  joinedAt: Date;
};

type ChatRoom = {
  id: number;
  picture: Image;
  participants: { users: ChatRoomParticipant[]; total: number };
  messages: Chat[];
  unreadMessages: UndreadMessageSimplified;
  description?: string | null;
  title?: string | null;
  isGroupChat: boolean;
  createdAt: Date;
  updatedAt: Date;
};

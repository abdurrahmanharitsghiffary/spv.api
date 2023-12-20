import { $Enums } from "@prisma/client";
import { Image } from "./profile";
import { UserSimplified } from "./user";

export type Chat = {
  id: number;
  readedBy: (UserSimplified & { readedAt: Date })[] | null;
  message: string | null;
  attachments: Image[];
  isGroupChat: boolean;
  author: UserSimplified;
  roomId: number;
  createdAt: Date;
  updatedAt: Date;
};

type UnreadMessageSimplified = {
  total: number;
};

type UnreadMessage = {
  total: number;
} & UnreadMessageSimplified;

type ChatRoomParticipant = UserSimplified & {
  role: $Enums.ParticipantRole;
  roomId: number;
  joinedAt: Date;
};

type ChatRoom = {
  id: number;
  picture: Image;
  participants: { users: ChatRoomParticipant[]; total: number };
  messages: Chat[];
  unreadMessages: UnreadMessageSimplified;
  description?: string | null;
  title?: string | null;
  isGroupChat: boolean;
  createdAt: Date;
  updatedAt: Date;
};
type ParticipantField = { id: number; role: $Enums.Role };
type ParticipantsField = ParticipantField[];

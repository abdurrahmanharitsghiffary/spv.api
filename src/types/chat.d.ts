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

type ChatRoomParticipant = UserSimplified & {
  role: $Enums.ParticipantRole;
  joinedAt: Date;
};

type ChatRoomSimplified = {
  id: number;
  picture: Image;
  totalParticipants: number;
  description?: string | null;
  title?: string | null;
  isGroupChat: boolean;
  createdAt: Date;
  applyType: $Enums.ApplyType;
  groupVisibility: $Enums.GroupType;
  updatedAt: Date;
};

type ChatRoom = {
  participants: ChatRoomParticipant[];
  messages: Chat[];
  totalUnreadMessages: number;
} & ChatRoomSimplified;

type ParticipantField = { id: number; role: $Enums.Role };
type ParticipantsField = ParticipantField[];

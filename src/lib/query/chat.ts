import { Prisma } from "@prisma/client";
import {
  excludeBlockedUser,
  excludeBlockingUser,
  selectUserSimplified,
} from "./user";

export const selectChat = {
  id: true,
  message: true,
  chatImage: {
    select: {
      id: true,
      src: true,
    },
  },
  author: {
    select: {
      ...selectUserSimplified,
    },
  },
  recipient: {
    select: {
      ...selectUserSimplified,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export type SelectChatPayload = Prisma.ChatGetPayload<{
  select: typeof selectChat;
}>;

export const selectChatRoom = {
  id: true,
  createdAt: true,
  description: true,
  isGroupChat: true,
  title: true,
  updatedAt: true,
  messages: {
    select: {
      ...selectChat,
    },
  },
  _count: {
    select: {
      participants: true,
      messages: {
        where: {
          isRead: false,
        },
      },
    },
  },
  participants: {
    take: 10,
    select: {
      createdAt: true,
      role: true,
      user: {
        select: {
          ...selectUserSimplified,
        },
      },
    },
  },
} satisfies Prisma.ChatRoomSelect;

export type SelectChatRoomPayload = Prisma.ChatRoomGetPayload<{
  select: typeof selectChatRoom;
}>;

export const selectChatRoomWithWhereInput = (userId?: number) =>
  ({
    participants: {
      take: 10,
      select: {
        createdAt: true,
        role: true,
        user: {
          select: {
            ...selectUserSimplified,
          },
        },
      },
      where: {
        AND: [
          {
            user: {
              ...excludeBlockedUser(userId),
              ...excludeBlockingUser(userId),
            },
          },
        ],
      },
    },
    id: true,
    createdAt: true,
    description: true,
    isGroupChat: true,
    title: true,
    updatedAt: true,
    messages: {
      select: {
        ...selectChat,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
      where: {
        OR: [
          {
            author: {
              ...excludeBlockedUser(userId),
              ...excludeBlockingUser(userId),
            },
          },
          {
            recipient: {
              ...excludeBlockedUser(userId),
              ...excludeBlockingUser(userId),
            },
          },
        ],
      },
    },
    _count: {
      select: {
        participants: true,
        messages: {
          where: {
            isRead: false,
          },
        },
      },
    },
  } satisfies Prisma.ChatRoomSelect);

export const selectRoomParticipant = {
  role: true,
  createdAt: true,
  user: { select: selectUserSimplified },
} satisfies Prisma.ChatRoomParticipantSelect;

export type ChatRoomParticipantPayload = Prisma.ChatRoomParticipantGetPayload<{
  select: typeof selectRoomParticipant;
}>;

import { Prisma } from "@prisma/client";

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
      profile: {
        select: {
          avatarImage: { select: { src: true } },
        },
      },
      id: true,
      username: true,
    },
  },
  recipient: {
    select: {
      profile: {
        select: {
          avatarImage: { select: { src: true } },
        },
      },
      id: true,
      username: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ChatSelect;

export type SelectChatPayload = Prisma.ChatGetPayload<{
  select: typeof selectChat;
}>;

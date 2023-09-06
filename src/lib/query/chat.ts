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
      id: true,
      username: true,
    },
  },
  recipient: {
    select: {
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

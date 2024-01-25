import { Prisma } from "@prisma/client";
import { RequestError } from "../../lib/error";
import { selectChat } from "../../lib/query/chat";
import { excludeBlockedUser, excludeBlockingUser } from "../../lib/query/user";
import Chat from "../../models/chat.models";
import { normalizeChat } from "./chat.normalize";
import { ChatRoom } from "../../models/chat.models";
import { NotFound } from "../../lib/messages";
import prisma from "../../config/prismaClient";

const selectChatRoomParticipants = {
  chatRoom: {
    select: {
      participants: {
        select: {
          userId: true,
        },
      },
    },
  },
} satisfies Prisma.ChatSelect;

const chatWhereAndInput = (currentUserId?: number) =>
  [
    {
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
  ] satisfies Prisma.ChatWhereInput["AND"];

export const findMessageByRoomId = async ({
  roomId,
  limit = 20,
  offset = 0,
}: {
  roomId: number;
  currentUserId: number;
  limit?: number;
  offset?: number;
}) => {
  const messages = await Chat.findMany({
    where: {
      chatRoomId: roomId,
    },
    select: { ...selectChat },
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    skip: offset,
  });

  const totalMessages = await Chat.count({
    where: {
      chatRoomId: roomId,
    },
  });

  return {
    data: await Promise.all(
      messages.map((msg) => Promise.resolve(normalizeChat(msg)))
    ),
    total: totalMessages,
  };
};

export const findMessageById = async (chatId: number) => {
  const chat = await Chat.findUnique({
    where: {
      id: chatId,
    },
    select: selectChat,
  });

  if (!chat) throw new RequestError(NotFound.MESSAGE, 404);
  const normalizedChat = await normalizeChat(chat);
  return normalizedChat;
};

export const findChatByParticipantIds = async ({
  limit,
  offset,
  participantsId,
  currentUserId,
  isGroupChat = false,
}: {
  limit?: number;
  offset?: number;
  participantsId: number[];
  isGroupChat?: boolean;
  currentUserId: number;
}) => {
  const chats = await ChatRoom.findFirst({
    where: {
      isGroupChat,
      participants: {
        every: {
          userId: {
            in: [...participantsId, currentUserId],
          },
        },
      },
      AND: [
        {
          participants: {
            every: {
              user: {
                ...excludeBlockedUser(currentUserId),
                ...excludeBlockingUser(currentUserId),
              },
            },
          },
        },
      ],
    },
    select: {
      _count: {
        select: {
          messages: true,
        },
      },
      messages: {
        select: {
          ...selectChat,
        },
        where: {
          AND: chatWhereAndInput(currentUserId),
        },
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!chats) throw new RequestError(NotFound.MESSAGE, 404);

  return {
    data: await Promise.all(
      (chats?.messages ?? []).map((chat) =>
        Promise.resolve(normalizeChat(chat))
      )
    ),
    total: chats?._count?.messages ?? 0,
  };
};

export const createChatWithRoomIdAndAuthorId = async (createOptions: {
  senderId: number;
  message: string;
  chatRoomId: number;
  images?: string[];
}) => {
  const { chatRoomId, senderId, message, images } = createOptions;

  return await prisma.$transaction(async (tx) => {
    const createdChat = await tx.chat.create({
      data: {
        chatRoomId,
        authorId: senderId,
        message,
      },
      select: {
        ...selectChat,
        chatRoom: {
          select: {
            isGroupChat: true,
            participants: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (images && images.length > 0) {
      await tx.image.createMany({
        data: images.map((src) => ({ chatId: createdChat.id, src })),
      });
      (createdChat as any).chatImage = images.map((src) => ({ src }));
    }

    return createdChat;
  });
};

export const deleteChatById = async (chatId: number) => {
  await checkIsMessageFound({ messageId: chatId });
  return await Chat.delete({
    where: {
      id: chatId,
    },
    select: {
      ...selectChat,
      chatRoom: {
        select: {
          isGroupChat: true,
          ...selectChatRoomParticipants.chatRoom.select,
        },
      },
    },
  });
};

export const updateChatById = async (chatId: number, message?: string) => {
  await checkIsMessageFound({ messageId: chatId });
  return await Chat.update({
    where: {
      id: chatId,
    },
    data: {
      message,
    },
    select: {
      ...selectChat,
      chatRoom: {
        select: {
          isGroupChat: true,
          ...selectChatRoomParticipants.chatRoom.select,
        },
      },
    },
  });
};

export const checkIsMessageFound = async ({
  customMessage,
  messageId,
}: {
  messageId: number;
  customMessage?: { message?: string; statusCode?: number };
}) => {
  const message = await Chat.findUnique({
    where: {
      id: messageId,
    },
    select: { id: true },
  });

  if (!message)
    throw new RequestError(
      customMessage?.message ?? NotFound.MESSAGE,
      customMessage?.statusCode ?? 404
    );

  return message;
};

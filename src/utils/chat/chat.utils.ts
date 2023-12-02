import { Prisma } from "@prisma/client";
import { RequestError } from "../../lib/error";
import { selectChat } from "../../lib/query/chat";
import { excludeBlockedUser, excludeBlockingUser } from "../../lib/query/user";
import Chat from "../../models/chat.models";
import { normalizeChat } from "./chat.normalize";
import { ChatRoom } from "../../models/chat.models";
import Image from "../../models/image.models";

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

export const findChatByRoomId = async ({
  currentUserId,
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
      AND: chatWhereAndInput(currentUserId),
    },
    select: selectChat,
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

export const findChatById = async (chatId: number, currentUserId?: number) => {
  const chat = await Chat.findUnique({
    where: {
      id: chatId,
      AND: chatWhereAndInput(currentUserId),
    },
    select: selectChat,
  });

  if (!chat) throw new RequestError("Chat not found", 404);
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

  if (!chats) throw new RequestError("Chat not found.", 404);

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
  imageSrc?: string;
}) => {
  const { chatRoomId, senderId, message } = createOptions;

  const createdChat = await Chat.create({
    data: {
      chatRoomId,
      authorId: senderId,
      message,
    },
    select: {
      ...selectChat,
      chatRoom: {
        select: {
          participants: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (createOptions?.imageSrc) {
    await Image.create({
      data: {
        chatId: createdChat.id,
        src: createOptions.imageSrc,
      },
    });
  }

  return createdChat;
};

export const deleteChatById = async (
  chatId: number,
  currentUserId?: number
) => {
  await findChatById(chatId, currentUserId);
  return await Chat.delete({
    where: {
      id: chatId,
    },
    select: { ...selectChat, ...selectChatRoomParticipants },
  });
};

export const updateChatById = async (
  chatId: number,
  message?: string,
  currentUserId?: number
) => {
  await findChatById(chatId, currentUserId);
  return await Chat.update({
    where: {
      id: chatId,
    },
    data: {
      message,
    },
    select: { ...selectChat, ...selectChatRoomParticipants },
  });
};

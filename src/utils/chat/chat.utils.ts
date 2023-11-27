import { $Enums, Prisma } from "@prisma/client";
import { RequestError } from "../../lib/error";
import {
  selectChat,
  selectChatRoom,
  selectChatRoomWithWhereInput,
} from "../../lib/query/chat";
import { excludeBlockedUser, excludeBlockingUser } from "../../lib/query/user";
import Chat from "../../models/chat.models";
import { normalizeChat, normalizeChatRooms } from "./chat.normalize";
import { ChatRoom as ChatRoomT, LastChat } from "../../types/chat";
import { simplifyUser } from "../user/user.normalize";
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

const chatRoomWhereOrInput = (currentUserId: number) =>
  [
    {
      isGroupChat: false,
      participants: {
        every: {
          user: {
            ...excludeBlockedUser(currentUserId),
            ...excludeBlockingUser(currentUserId),
          },
        },
      },
    },
    {
      isGroupChat: true,
      participants: {
        some: {
          user: {
            ...excludeBlockedUser(currentUserId),
            ...excludeBlockingUser(currentUserId),
          },
        },
      },
    },
  ] satisfies Prisma.ChatRoomWhereInput["OR"];

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
    data: messages.map((msg) => normalizeChat(msg)),
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

  return normalizeChat(chat);
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
    data: (chats?.messages ?? []).map((chat) => normalizeChat(chat)),
    total: chats?._count?.messages ?? 0,
  };
};

export const findChatRoomById = async (id: number, currentUserId: number) => {
  const chatRoom = await ChatRoom.findUnique({
    where: {
      id,
      OR: chatRoomWhereOrInput(currentUserId),
    },
    select: selectChatRoomWithWhereInput(currentUserId),
  });

  if (!chatRoom) throw new RequestError("Chat room not found.", 404);

  return chatRoom;
};

export const findAllUserChat = async ({
  userId,
  limit,
  offset,
}: {
  limit?: number;
  offset?: number;
  userId: number;
}): Promise<{ data: ChatRoomT[]; total: number }> => {
  const rooms = await ChatRoom.findMany({
    where: {
      OR: [
        {
          isGroupChat: false,
          participants: {
            some: {
              userId: {
                in: [userId],
              },
            },
          },
          AND: [
            {
              participants: {
                every: {
                  user: {
                    ...excludeBlockedUser(userId),
                    ...excludeBlockingUser(userId),
                  },
                },
              },
            },
          ],
        },
        {
          isGroupChat: true,
          participants: {
            some: {
              userId: {
                in: [userId],
              },
            },
          },
          AND: [
            {
              participants: {
                some: {
                  user: {
                    ...excludeBlockedUser(userId),
                    ...excludeBlockingUser(userId),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    skip: offset,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: selectChatRoomWithWhereInput(userId),
  });

  const totalRooms = await ChatRoom.count({
    where: {
      OR: [
        {
          isGroupChat: false,
          participants: {
            some: {
              userId: {
                in: [userId],
              },
            },
          },
          AND: [
            {
              participants: {
                every: {
                  user: {
                    ...excludeBlockedUser(userId),
                    ...excludeBlockingUser(userId),
                  },
                },
              },
            },
          ],
        },
        {
          isGroupChat: true,
          participants: {
            some: {
              userId: {
                in: [userId],
              },
            },
          },
          AND: [
            {
              participants: {
                some: {
                  user: {
                    ...excludeBlockedUser(userId),
                    ...excludeBlockingUser(userId),
                  },
                },
              },
            },
          ],
        },
      ],
    },
  });

  const chatRoom: ChatRoomT[] = rooms.map((room) => normalizeChatRooms(room));

  return { data: chatRoom, total: totalRooms };
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
    select: selectChatRoomParticipants,
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
    select: selectChatRoomParticipants,
  });
};

type CreateChatRoomOptions = {
  participantIds: number[];
  currentUserId: number;
};

export const createChatRoom = async ({
  participantIds,
  currentUserId,
}: CreateChatRoomOptions) => {
  const chatRoom = await ChatRoom.create({
    data: {
      participants: {
        createMany: {
          skipDuplicates: true,
          data: [
            ...participantIds.map((id) => ({
              userId: id,
              role: "user" as $Enums.ParticipantRole,
            })),
            {
              userId: currentUserId,
              role: "user",
            },
          ],
        },
      },
    },
    select: {
      ...selectChatRoom,
    },
  });

  return normalizeChatRooms(chatRoom);
};

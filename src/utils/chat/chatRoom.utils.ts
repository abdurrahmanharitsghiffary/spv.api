import { $Enums, Prisma } from "@prisma/client";
import { excludeBlockedUser, excludeBlockingUser } from "../../lib/query/user";
import { ChatRoom } from "../../models/chat.models";
import {
  selectChatRoomPWL,
  selectChatRoomWithWhereInput,
} from "../../lib/query/chat";
import { RequestError } from "../../lib/error";
import { ChatRoom as ChatRoomT } from "../../types/chat";
import { normalizeChatRooms } from "./chatRoom.normalize";
import prisma from "../../config/prismaClient";
import { userWhereAndInput } from "../user/user.utils";
import { Code } from "../../lib/code";
import User from "../../models/user.models";
import { NotFound } from "../../lib/messages";

export const chatRoomWhereOrInput = (currentUserId: number) =>
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

export const findChatRoomById = async (
  id: number,
  currentUserId: number,
  opt?: { message?: string; statusCode?: number }
) => {
  const chatRoom = await ChatRoom.findUnique({
    where: {
      id,
      OR: chatRoomWhereOrInput(currentUserId),
    },
    select: selectChatRoomWithWhereInput(currentUserId),
  });

  if (!chatRoom)
    throw new RequestError(
      opt?.message ?? NotFound.CHAT_ROOM,
      opt?.statusCode ?? 404
    );

  const normalizedRoom = await normalizeChatRooms(chatRoom);

  return normalizedRoom;
};

export const findAllUserChatRoom = async ({
  userId,
  limit,
  offset,
  type = "all",
  q,
}: {
  q?: string;
  limit?: number;
  offset?: number;
  userId: number;
  type: "group" | "personal" | "all";
}): Promise<{ data: ChatRoomT[]; total: number }> => {
  const groupFilter =
    type === "group" ? true : type === "personal" ? false : undefined;

  const filter = () => ({
    AND: [
      {
        participants: {
          some: {
            userId: {
              in: [userId],
            },
          },
        },
      },
    ],
    OR: [
      {
        isGroupChat: false,
        participants: {
          some: {
            AND: [
              {
                user: {
                  fullName: {
                    contains: q,
                  },
                  id: {
                    not: userId,
                  },
                },
              },
            ],
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
        AND: [
          { title: { contains: q } },
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
  });

  const rooms = await ChatRoom.findMany({
    where: {
      isGroupChat: groupFilter,
      ...filter(),
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
      isGroupChat: groupFilter,
      ...filter(),
    },
  });

  const chatRoom: ChatRoomT[] = await Promise.all(
    rooms.map((room) => Promise.resolve(normalizeChatRooms(room)))
  );

  return { data: chatRoom, total: totalRooms };
};

type CreateChatRoomOptions = {
  participants?: { id: number; role: "admin" | "user" }[];
  currentUserId: number;
  isGroupChat?: boolean;
  description?: string;
  title?: string;
  imageSrc?: string;
};

export const createChatRoom = async ({
  participants = [],
  currentUserId,
  isGroupChat = false,
  description,
  title,
  imageSrc,
}: CreateChatRoomOptions) => {
  participants = participants
    .map((item) => ({ ...item, id: Number(item.id) }))
    .filter((item) => !isNaN(item.id));

  const isUserIncludedInFields = participants.some(
    (item) => item.id === currentUserId
  );

  if (isUserIncludedInFields) {
    throw new RequestError(
      "participants field should not contain the group chat creator (it will be automatically added as creator).",
      400
    );
  }

  let errors: any[] = [];

  await Promise.all(
    participants.map(async (item) => {
      const user = await User.findUnique({
        where: {
          id: item.id,
          AND: userWhereAndInput(currentUserId),
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        errors.push({
          message: NotFound.USER,
          id: item.id,
          code: Code.NOT_FOUND,
        });
      }
    })
  );

  if (errors.length > 0)
    throw new RequestError("Not found", 404, errors, "create_chat_room");

  return await prisma.$transaction(async (tx) => {
    if (!isGroupChat) {
      const chatRoomIsExist = await tx.chatRoom.findFirst({
        where: {
          isGroupChat: false,
          participants: {
            every: {
              userId: {
                in: [
                  ...participants.map((participant) => participant.id),
                  currentUserId,
                ],
              },
            },
          },
        },
      });

      if (chatRoomIsExist) {
        throw new RequestError("Chat room already created.", 409);
      }
    }

    const chatRoom = await tx.chatRoom.create({
      data: {
        isGroupChat,
        description,
        title,
        participants: {
          createMany: {
            skipDuplicates: true,
            data: [
              ...participants.map((item) => ({
                userId: item.id,
                role: isGroupChat
                  ? item.role ?? "user"
                  : ("creator" as $Enums.ParticipantRole),
              })),
              {
                userId: currentUserId,
                role: "creator",
              },
            ],
          },
        },
      },
      select: {
        ...selectChatRoomPWL(currentUserId),
      },
    });

    if (imageSrc) {
      await tx.image.create({
        data: {
          groupId: chatRoom.id,
          src: imageSrc,
        },
      });
    }

    const normalizedRoom = await normalizeChatRooms(chatRoom);
    return normalizedRoom;
  });
};

export const isChatRoomFound = async ({
  chatRoomId,
  currentUserId,
  customMessage,
}: {
  customMessage?: { message?: string; statusCode?: number };
  chatRoomId: number;
  currentUserId?: number;
}) => {
  const orInput = currentUserId
    ? chatRoomWhereOrInput(currentUserId)
    : undefined;

  const chatRoom = await ChatRoom.findUnique({
    where: {
      id: chatRoomId,
      OR: orInput,
    },
    select: { id: true },
  });

  if (!chatRoom)
    throw new RequestError(
      customMessage?.message ?? NotFound.CHAT_ROOM,
      customMessage?.statusCode ?? 404
    );

  return chatRoom;
};

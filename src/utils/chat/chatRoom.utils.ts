import { $Enums, Prisma } from "@prisma/client";
import { excludeBlockedUser, excludeBlockingUser } from "../../lib/query/user";
import { ChatRoom } from "../../models/chat.models";
import {
  selectChatRoom,
  selectChatRoomWithWhereInput,
} from "../../lib/query/chat";
import { RequestError } from "../../lib/error";
import { ChatRoom as ChatRoomT } from "../../types/chat";
import { normalizeChatRooms } from "./chatRoom.normalize";
import Image from "../../models/image.models";
import { getFileDest } from "..";
import prisma from "../../config/prismaClient";
import { findUserById } from "../user/user.utils";

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
      opt?.message ?? "Chat room not found.",
      opt?.statusCode ?? 404
    );

  const normalizedRoom = await normalizeChatRooms(chatRoom);

  return normalizedRoom;
};

export const findAllUserChatRoom = async ({
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

  const chatRoom: ChatRoomT[] = await Promise.all(
    rooms.map((room) => Promise.resolve(normalizeChatRooms(room)))
  );

  return { data: chatRoom, total: totalRooms };
};

type CreateChatRoomOptions = {
  participantIds: number[];
  currentUserId: number;
  isGroupChat?: boolean;
  description?: string;
  title?: string;
  image?: Express.Multer.File;
  admins?: number[];
};

export const createChatRoom = async ({
  participantIds = [],
  currentUserId,
  isGroupChat = false,
  description,
  title,
  image,
  admins = [],
}: CreateChatRoomOptions) => {
  participantIds = participantIds
    .map((id) => Number(id))
    .filter((id) => !isNaN(id));

  admins = admins.map((id) => Number(id)).filter((id) => !isNaN(id));

  return await prisma.$transaction(async (tx) => {
    participantIds.forEach(async (id) => {
      await findUserById(id);
    });

    if (admins?.length > 0) {
      admins.forEach(async (id) => {
        await findUserById(id);
      });
    }

    if (!isGroupChat) {
      const chatRoomIsExist = await tx.chatRoom.findFirst({
        where: {
          isGroupChat: false,
          participants: {
            every: {
              userId: {
                in: [...participantIds, currentUserId],
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
              ...participantIds.map((id) => ({
                userId: id,
                role: "user" as $Enums.ParticipantRole,
              })),
              {
                userId: currentUserId,
                role: isGroupChat ? "admin" : "user",
              },
            ],
          },
        },
      },
      select: {
        ...selectChatRoom,
      },
    });

    if (image) {
      await tx.image.create({
        data: {
          groupId: chatRoom.id,
          src: getFileDest(image) as string,
        },
      });
    }

    const normalizedRoom = await normalizeChatRooms(chatRoom);
    return normalizedRoom;
  });
};

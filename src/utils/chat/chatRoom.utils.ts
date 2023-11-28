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

export const findChatRoomById = async (id: number, currentUserId: number) => {
  const chatRoom = await ChatRoom.findUnique({
    where: {
      id,
      OR: chatRoomWhereOrInput(currentUserId),
    },
    select: selectChatRoomWithWhereInput(currentUserId),
  });

  if (!chatRoom) throw new RequestError("Chat room not found.", 404);

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
    rooms.map((room) => normalizeChatRooms(room))
  );

  return { data: chatRoom, total: totalRooms };
};

type CreateChatRoomOptions = {
  participantIds: number[];
  currentUserId: number;
  isGroupChat?: boolean;
};

export const createChatRoom = async ({
  participantIds,
  currentUserId,
  isGroupChat = false,
}: CreateChatRoomOptions) => {
  if (!isGroupChat) {
    const chatRoomIsExist = await ChatRoom.findFirst({
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

  const chatRoom = await ChatRoom.create({
    data: {
      isGroupChat,
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

  const normalizedRoom = await normalizeChatRooms(chatRoom);
  return normalizedRoom;
};

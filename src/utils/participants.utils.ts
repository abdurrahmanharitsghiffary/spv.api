import { RequestError } from "../lib/error";
import { NotFound } from "../lib/messages";
import { selectRoomParticipant } from "../lib/query/chat";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import { ChatRoomParticipant } from "../models/chat.models";
import { normalizeChatParticipant } from "./chat/chat.normalize";

export const findNotUserRoleParticipant = async (
  roomId: number,
  userId: number
) => {
  const participants = await ChatRoomParticipant.findMany({
    where: {
      role: { not: "user" },
      chatRoomId: roomId,
    },
    select: { userId: true },
  });
  return participants;
};

export const findParticipantsByRoomId = async ({
  roomId,
  currentUserId,
  limit,
  offset,
}: {
  roomId: number;
  currentUserId: number;
  limit?: number;
  offset?: number;
}) => {
  const participants = await ChatRoomParticipant.findMany({
    where: {
      chatRoomId: Number(roomId),
      AND: [
        {
          user: {
            ...excludeBlockedUser(Number(currentUserId)),
            ...excludeBlockingUser(Number(currentUserId)),
          },
        },
      ],
    },
    orderBy: [
      {
        role: "asc",
      },
      {
        user: { fullName: "asc" },
      },
    ],
    skip: offset,
    take: limit,
    select: selectRoomParticipant,
  });

  const normalizedParticipants = await Promise.all(
    participants.map((participant) =>
      Promise.resolve(normalizeChatParticipant(participant))
    )
  );

  const total = await ChatRoomParticipant.count({
    where: {
      chatRoomId: Number(roomId),
    },
  });

  return { data: normalizedParticipants, total };
};

export const findParticipantById = async ({
  chatRoomId,
  userId,
  throwOnFound,
  error,
}: {
  chatRoomId: number;
  userId: number;
  throwOnFound?: boolean;
  error?: { message: string; statusCode: number };
}) => {
  const participant = await ChatRoomParticipant.findUnique({
    where: {
      chatRoomId_userId: {
        chatRoomId,
        userId,
      },
    },
    select: selectRoomParticipant,
  });

  if (!participant) {
    throw new RequestError(NotFound.PARTICIPANT, 404);
  }

  if (throwOnFound) {
    throw new RequestError(error?.message ?? "", error?.statusCode ?? 400);
  }
  const normalizedParticipant = await normalizeChatParticipant(participant);

  return normalizedParticipant;
};

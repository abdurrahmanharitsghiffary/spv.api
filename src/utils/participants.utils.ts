import { selectRoomParticipant } from "../lib/query/chat";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import { ChatRoomParticipant } from "../models/chat.models";
import { normalizeChatParticipant } from "./chat/chat.normalize";

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
    orderBy: {
      createdAt: "desc",
    },
    skip: offset,
    take: limit,
    select: selectRoomParticipant,
  });

  const normalizedParticipants = await Promise.all(
    participants.map((participant) => normalizeChatParticipant(participant))
  );

  const total = await ChatRoomParticipant.count({
    where: {
      chatRoomId: roomId,
    },
  });

  return { data: normalizedParticipants, total };
};

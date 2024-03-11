import {
  SelectChatRoomPayload,
  SelectChatRoomSimplifiedPayload,
} from "../../lib/query/chat";
import { ChatRoom, ChatRoomSimplified } from "../../types/chat";
import { normalizeChat, normalizeChatParticipant } from "./chat.normalize";

export const normalizeChatRooms = (
  room: SelectChatRoomPayload
): Promise<ChatRoom> =>
  new Promise(async (resolve) => {
    return resolve({
      createdAt: room.createdAt,
      id: room.id,
      picture: room.groupPicture,
      isGroupChat: room.isGroupChat,
      messages: await Promise.all(
        room.messages.map((message) => Promise.resolve(normalizeChat(message)))
      ),
      totalUnreadMessages: room._count.messages,
      updatedAt: room.updatedAt,
      description: room.description,
      title: room.title,
      participants: await Promise.all(
        room.participants.map((participant) =>
          Promise.resolve(normalizeChatParticipant(participant))
        )
      ),
      totalParticipants: room._count.participants,
      applyType: room.applyType,
      groupVisibility: room.groupVisibility,
    });
  });

export const normalizeChatRoomSimplified = async (
  payload: SelectChatRoomSimplifiedPayload
): Promise<ChatRoomSimplified> => {
  return Promise.resolve({
    applyType: payload.applyType,
    createdAt: payload.createdAt,
    id: payload.id,
    groupVisibility: payload.groupVisibility,
    isGroupChat: payload.isGroupChat,
    picture: payload.groupPicture,
    totalParticipants: payload._count.participants,
    updatedAt: payload.updatedAt,
    description: payload.description,
    title: payload.title,
  });
};

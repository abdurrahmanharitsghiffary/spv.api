import { SelectChatRoomPayload } from "../../lib/query/chat";
import { ChatRoom } from "../../types/chat";
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
      unreadMessages: { total: room._count.messages },
      updatedAt: room.updatedAt,
      description: room.description,
      title: room.title,
      participants: {
        users: await Promise.all(
          room.participants.map((participant) =>
            Promise.resolve(normalizeChatParticipant(participant))
          )
        ),
        total: room._count.participants,
      },
    });
  });

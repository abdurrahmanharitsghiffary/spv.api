import { $Enums } from "@prisma/client";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { ChatRoom, ChatRoomParticipant } from "./chat";

export type SocketData = {
  user:
    | {
        id: number;
        firstName: string;
        lastName: string;
        fullName: string | null;
        username: string;
        isOnline: boolean;
        email: string;
        hashedPassword: string;
        role: $Enums.Role;
        googleId: string | null;
        provider: "GOOGLE" | null;
        createdAt: Date;
        updatedAt: Date;
        verified: boolean;
      }
    | undefined;
};

export type IoServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

type URP = {
  updating: "participants";
  data: ChatRoomParticipant[];
};

type URD = {
  updating: "details";
  data: ChatRoom;
};

type URDEL = {
  updating: "delete-participants";
  data: number[];
};

export type UpdateRoom = URP | URD | URDEL;

import { $Enums } from "@prisma/client";
import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

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

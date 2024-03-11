import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import JWT from "jsonwebtoken";
import User from "../models/user.models";
import { Socket_Event } from "./event";
import { RequestError, UnauthorizedError } from "../lib/error";
import { ACCESS_TOKEN_SECRET, Socket_Id } from "../lib/consts";
import { ChatRoomParticipant, ReadChat } from "../models/chat.models";
import { UserSimplified } from "../types/user";
import { selectRoomParticipant } from "../lib/query/chat";
import { selectUserSimplified } from "../lib/query/user";
import { simplifyUserWF } from "../utils/user/user.normalize";

export const ioInit = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  io.use(async (socket, next) => {
    try {
      const headers = socket.handshake.headers;
      let accessToken = (headers["authorization"] ?? "").split(" ")?.[1] ?? "";

      if (!accessToken) {
        accessToken = socket.handshake.auth.token;
      }

      if (!accessToken) {
        throw new RequestError("No token provided!", 401);
      }

      const decoded = await JWT.verify(accessToken, ACCESS_TOKEN_SECRET ?? "");

      const user = await User.findUnique({
        where: {
          email: (decoded as JWT.JwtPayload)?.email ?? "",
        },
      });

      if (!user) {
        throw new UnauthorizedError();
      }
      socket.data.user = user;
      next();
    } catch (err: any) {
      next(err);
    }
  });
  io.on("connection", async (socket) => {
    try {
      const user = socket.data.user;
      socket.join(Socket_Id(user.id, "USER"));

      await User.update({
        where: {
          id: Number(user.id),
        },
        data: {
          isOnline: true,
        },
      });
      io.emit(Socket_Event.ONLINE, Socket_Id(user.id, "USER"));

      socket.on(Socket_Event.OPEN, async () => {});

      socket.on(Socket_Event.LEAVE, async () => {
        await User.update({
          where: {
            id: Number(user.id),
          },
          data: {
            isOnline: false,
          },
        });
        io.emit(Socket_Event.OFFLINE, Socket_Id(user.id, "USER"));
      });

      socket.on(Socket_Event.VISIT_ROOM, (roomId: number) => {
        socket.join(Socket_Id(roomId, "ROOM"));
      });

      socket.on(Socket_Event.UNVISIT_ROOM, (roomId: number) => {
        socket.leave(Socket_Id(roomId, "ROOM"));
      });

      socket.on(
        Socket_Event.TYPING_MESSAGE,
        (data: {
          chatId: number;
          userId: string;
          fullName: string;
          username: string;
        }) => {
          io.in(Socket_Id(data.chatId, "ROOM")).emit(
            Socket_Event.USER_TYPING,
            data
          );
        }
      );

      socket.on(
        Socket_Event.TYPING_END,
        (data: {
          chatId: number;
          userId: number;
          fullName: string;
          username: string;
        }) => {
          io.in(Socket_Id(data.chatId, "ROOM")).emit(
            Socket_Event.USER_TYPING_END,
            data
          );
        }
      );

      socket.on(
        Socket_Event.READ_MESSAGE,
        async (data: { userId: number; chatId: number; roomId: number }) => {
          const isParticipated = await ChatRoomParticipant.findUnique({
            where: {
              chatRoomId_userId: {
                chatRoomId: data.roomId,
                userId: data.userId,
              },
            },
          });
          if (!isParticipated) return;

          const isDuplicated = await ReadChat.findUnique({
            where: {
              userId_chatId: {
                userId: data.userId,
                chatId: data.chatId,
              },
            },
          });
          if (isDuplicated) return;

          try {
            const readedMessage = await ReadChat.create({
              data: {
                userId: data.userId,
                chatId: data.chatId,
              },
              select: {
                createdAt: true,
                user: {
                  select: {
                    ...selectUserSimplified,
                  },
                },
                chat: {
                  select: {
                    id: true,
                    chatRoom: {
                      select: {
                        id: true,
                        participants: {
                          select: {
                            ...selectRoomParticipant,
                          },
                        },
                      },
                    },
                  },
                },
              },
            });

            const readingUser = readedMessage.user;

            const simplifiedUser = await simplifyUserWF(readingUser);

            const normalizedReader: UserSimplified & { readedAt: Date } = {
              ...simplifiedUser,
              readedAt: readedMessage.createdAt,
            };

            readedMessage.chat.chatRoom.participants.forEach((participant) => {
              io.in(Socket_Id(participant.user.id, "USER")).emit(
                Socket_Event.READED_MESSAGE,
                {
                  ...normalizedReader,
                  roomId: participant.chatRoomId,
                  chatId: readedMessage.chat.id,
                }
              );
            });
          } catch (err) {
            console.error(err);
          }
        }
      );

      socket.on("disconnect", async () => {
        try {
          const offlineUser = await User.update({
            where: {
              id: Number(user.id),
            },
            data: {
              isOnline: false,
            },
          });
          io.emit(Socket_Event.OFFLINE, Socket_Id(offlineUser.id, "USER"));
        } catch (err) {
          console.error(err);
        }
      });
    } catch (err: any) {
      socket.emit(
        Socket_Event.ERROR,
        err?.message ?? "Something went wrong while connection to the socket."
      );
    }
  });
};

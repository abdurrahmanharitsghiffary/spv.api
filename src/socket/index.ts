import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import JWT from "jsonwebtoken";
import User from "../models/user.models";
import { Socket_Event } from "./event";
import { RequestError, UnauthorizedError } from "../lib/error";
import { ACCESS_TOKEN_SECRET } from "../lib/consts";
import Chat, { ChatRoomParticipant, ReadChat } from "../models/chat.models";

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
      console.log("Connected");
      const user = socket.data.user;
      // console.log(user, "Logged socket user");
      socket.join(user.id.toString());

      await User.update({
        where: {
          id: Number(user.id),
        },
        data: {
          isOnline: true,
        },
      });
      io.emit(Socket_Event.ONLINE, user.id.toString());

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
        io.emit(Socket_Event.OFFLINE, user.id.toString());
      });

      socket.on(Socket_Event.VISIT_ROOM, (roomId: number) => {
        console.log("Joined Room: ", roomId);
        socket.join(roomId.toString());
        console.log("JOINED ROOMS", socket.rooms);
      });

      socket.on(
        Socket_Event.TYPING_MESSAGE,
        (data: {
          chatId: number;
          userId: string;
          fullName: string;
          username: string;
        }) => {
          console.log(data.userId, " Typing...");
          console.log("Chat id: ", data.chatId);
          io.in(data.chatId.toString()).emit(Socket_Event.USER_TYPING, data);
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
          io.in(data.chatId.toString()).emit(
            Socket_Event.USER_TYPING_END,
            data
          );
        }
      );

      socket.on(
        Socket_Event.READ_MESSAGE,
        async (data: { userId: number; chatId: number }) => {
          const isParticipated = await ChatRoomParticipant.findUnique({
            where: {
              chatRoomId_userId: {
                chatRoomId: data.chatId,
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

          const readedMessage = await ReadChat.create({
            data: {
              userId: data.userId,
              chatId: data.chatId,
            },
            select: {
              chat: {
                select: {
                  id: true,
                  chatRoom: {
                    select: {
                      id: true,
                      participants: {
                        select: {
                          userId: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          readedMessage.chat.chatRoom.participants.forEach((participant) => {
            socket
              .to(participant.userId.toString())
              .emit(Socket_Event.READED_MESSAGE, {
                chatId: readedMessage.chat.id,
                roomId: readedMessage.chat.chatRoom.id,
              });
          });
        }
      );

      socket.on("disconnect", async () => {
        console.log("Disconnected");
        const offlineUser = await User.update({
          where: {
            id: Number(user.id),
          },
          data: {
            isOnline: false,
          },
        });

        io.emit(Socket_Event.OFFLINE, offlineUser.id.toString());
      });
    } catch (err: any) {
      socket.emit(
        Socket_Event.ERROR,
        err?.message ?? "Something went wrong while connection to the socket."
      );
    }
  });
};

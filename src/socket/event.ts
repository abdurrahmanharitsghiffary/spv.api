export const Socket_Event = Object.freeze({
  OPEN: "open",
  LEAVE_ROOM: "leaveRoom",
  JOIN_ROOM: "joinRoom",
  LEAVE: "leave",
  // MESSAGE: "message",
  NOTIFICATION: "notification",
  RECEIVE_NOTIFICATION: "receiveNotification",
  RECEIVE_MESSAGE: "receiveMessage",
  UPDATE_MESSAGE: "updateMessage",
  ONLINE: "online",
  OFFLINE: "offline",
  ERROR: "socketError",
  DELETE_MESSAGE: "deleteMessage",
  TYPING_MESSAGE: "typingMessage",
  UNTYPING_MESSAGE: "untypingMessage",
  DELETE_ROOM: "deleteRoom",
  UPDATE_ROOM: "updateRoom",
  CREATE_ROOM: "createRoom",
});
type ValueOf<T> = T[keyof T];
export type SOCKETEVENT = ValueOf<typeof Socket_Event>;

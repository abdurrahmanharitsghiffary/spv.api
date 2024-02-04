"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ioInit = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_models_1 = __importDefault(require("../models/user.models"));
const event_1 = require("./event");
const error_1 = require("../lib/error");
const consts_1 = require("../lib/consts");
const chat_models_1 = require("../models/chat.models");
const chat_1 = require("../lib/query/chat");
const user_1 = require("../lib/query/user");
const user_normalize_1 = require("../utils/user/user.normalize");
const notification_models_1 = __importDefault(require("../models/notification.models"));
const notification_1 = require("../lib/query/notification");
const notification_normalize_1 = require("../utils/notification/notification.normalize");
const utils_1 = require("../utils");
const ioInit = (io) => {
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const headers = socket.handshake.headers;
            let accessToken = (_c = (_b = ((_a = headers["authorization"]) !== null && _a !== void 0 ? _a : "").split(" ")) === null || _b === void 0 ? void 0 : _b[1]) !== null && _c !== void 0 ? _c : "";
            if (!accessToken) {
                accessToken = socket.handshake.auth.token;
            }
            if (!accessToken) {
                throw new error_1.RequestError("No token provided!", 401);
            }
            const decoded = yield jsonwebtoken_1.default.verify(accessToken, consts_1.ACCESS_TOKEN_SECRET !== null && consts_1.ACCESS_TOKEN_SECRET !== void 0 ? consts_1.ACCESS_TOKEN_SECRET : "");
            const user = yield user_models_1.default.findUnique({
                where: {
                    email: (_d = decoded === null || decoded === void 0 ? void 0 : decoded.email) !== null && _d !== void 0 ? _d : "",
                },
            });
            if (!user) {
                throw new error_1.UnauthorizedError();
            }
            socket.data.user = user;
            next();
        }
        catch (err) {
            next(err);
        }
    }));
    io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        try {
            console.log("Connected");
            const user = socket.data.user;
            socket.join((0, consts_1.Socket_Id)(user.id, "USER"));
            yield user_models_1.default.update({
                where: {
                    id: Number(user.id),
                },
                data: {
                    isOnline: true,
                },
            });
            io.emit(event_1.Socket_Event.ONLINE, (0, consts_1.Socket_Id)(user.id, "USER"));
            const countNotification = yield (0, utils_1.getNotificationCount)(user.id);
            console.log(countNotification, "Count notification");
            socket.on(event_1.Socket_Event.GET_NOTIFICATION_COUNT, () => __awaiter(void 0, void 0, void 0, function* () {
                socket.emit(event_1.Socket_Event.COUNT_NOTIFICATION, countNotification);
            }));
            socket.on(event_1.Socket_Event.GET_MESSAGE_COUNT, () => __awaiter(void 0, void 0, void 0, function* () {
                const countMessage = yield (0, utils_1.getMessageCount)(user.id);
                socket.emit(event_1.Socket_Event.COUNT_MESSAGE, countMessage);
            }));
            socket.on(event_1.Socket_Event.OPEN, () => __awaiter(void 0, void 0, void 0, function* () { }));
            socket.on(event_1.Socket_Event.LEAVE, () => __awaiter(void 0, void 0, void 0, function* () {
                yield user_models_1.default.update({
                    where: {
                        id: Number(user.id),
                    },
                    data: {
                        isOnline: false,
                    },
                });
                io.emit(event_1.Socket_Event.OFFLINE, (0, consts_1.Socket_Id)(user.id, "USER"));
            }));
            socket.on(event_1.Socket_Event.VISIT_ROOM, (roomId) => {
                socket.join((0, consts_1.Socket_Id)(roomId, "ROOM"));
                console.log(socket.rooms, "Rooms");
            });
            socket.on(event_1.Socket_Event.UNVISIT_ROOM, (roomId) => {
                socket.leave((0, consts_1.Socket_Id)(roomId, "ROOM"));
                console.log(socket.rooms, "Rooms");
            });
            socket.on(event_1.Socket_Event.TYPING_MESSAGE, (data) => {
                io.in((0, consts_1.Socket_Id)(data.chatId, "ROOM")).emit(event_1.Socket_Event.USER_TYPING, data);
            });
            socket.on(event_1.Socket_Event.TYPING_END, (data) => {
                io.in((0, consts_1.Socket_Id)(data.chatId, "ROOM")).emit(event_1.Socket_Event.USER_TYPING_END, data);
            });
            socket.on(event_1.Socket_Event.READ_MESSAGE, (data) => __awaiter(void 0, void 0, void 0, function* () {
                const isParticipated = yield chat_models_1.ChatRoomParticipant.findUnique({
                    where: {
                        chatRoomId_userId: {
                            chatRoomId: data.roomId,
                            userId: data.userId,
                        },
                    },
                });
                if (!isParticipated)
                    return;
                const isDuplicated = yield chat_models_1.ReadChat.findUnique({
                    where: {
                        userId_chatId: {
                            userId: data.userId,
                            chatId: data.chatId,
                        },
                    },
                });
                if (isDuplicated)
                    return;
                try {
                    const readedMessage = yield chat_models_1.ReadChat.create({
                        data: {
                            userId: data.userId,
                            chatId: data.chatId,
                        },
                        select: {
                            createdAt: true,
                            user: {
                                select: Object.assign({}, user_1.selectUserSimplified),
                            },
                            chat: {
                                select: {
                                    id: true,
                                    chatRoom: {
                                        select: {
                                            id: true,
                                            participants: {
                                                select: Object.assign({}, chat_1.selectRoomParticipant),
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    });
                    const readingUser = readedMessage.user;
                    const simplifiedUser = yield (0, user_normalize_1.simplifyUserWF)(readingUser);
                    const normalizedReader = Object.assign(Object.assign({}, simplifiedUser), { readedAt: readedMessage.createdAt });
                    readedMessage.chat.chatRoom.participants.forEach((participant) => {
                        io.in((0, consts_1.Socket_Id)(participant.user.id, "USER")).emit(event_1.Socket_Event.READED_MESSAGE, Object.assign(Object.assign({}, normalizedReader), { roomId: participant.chatRoomId, chatId: readedMessage.chat.id }));
                    });
                }
                catch (err) {
                    console.error(err);
                }
            }));
            socket.on(event_1.Socket_Event.READ_ALL_NOTIFICATION, () => __awaiter(void 0, void 0, void 0, function* () {
                yield notification_models_1.default.updateMany({
                    where: {
                        receiverId: user.id,
                        isRead: false,
                    },
                    data: {
                        isRead: true,
                    },
                });
                socket.emit(event_1.Socket_Event.READED_ALL_NOTIFICATION, "success");
            }));
            socket.on(event_1.Socket_Event.READ_NOTIFICATION, (data) => __awaiter(void 0, void 0, void 0, function* () {
                const notification = yield notification_models_1.default.findUnique({
                    where: {
                        id: data.notificationId,
                    },
                });
                if ((notification === null || notification === void 0 ? void 0 : notification.receiverId) !== user.id || (notification === null || notification === void 0 ? void 0 : notification.isRead))
                    return null;
                const updatedNotification = yield notification_models_1.default.update({
                    where: {
                        id: data.notificationId,
                    },
                    data: { isRead: true },
                    select: Object.assign({}, notification_1.selectNotificationSimplified),
                });
                const normalizedNotification = yield (0, notification_normalize_1.normalizeNotification)(updatedNotification);
                socket.emit(event_1.Socket_Event.READED_NOTIFICATION, normalizedNotification);
            }));
            socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
                const offlineUser = yield user_models_1.default.update({
                    where: {
                        id: Number(user.id),
                    },
                    data: {
                        isOnline: false,
                    },
                });
                io.emit(event_1.Socket_Event.OFFLINE, (0, consts_1.Socket_Id)(offlineUser.id, "USER"));
            }));
        }
        catch (err) {
            socket.emit(event_1.Socket_Event.ERROR, (_e = err === null || err === void 0 ? void 0 : err.message) !== null && _e !== void 0 ? _e : "Something went wrong while connection to the socket.");
        }
    }));
};
exports.ioInit = ioInit;

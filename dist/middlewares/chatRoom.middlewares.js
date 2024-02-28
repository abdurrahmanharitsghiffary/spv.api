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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGroupVisibility = exports.protectChatRoom = void 0;
const handler_middlewares_1 = require("./handler.middlewares");
const error_1 = require("../lib/error");
const chatRoom_utils_1 = require("../utils/chat/chatRoom.utils");
const chat_models_1 = require("../models/chat.models");
const messages_1 = require("../lib/messages");
const protectChatRoom = (params, isGroupChat, protectDelete) => (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const roomId = Number(req.params[params]);
    const uId = Number(userId);
    const room = yield chat_models_1.ChatRoom.findUnique({
        where: {
            id: roomId,
            isGroupChat,
            OR: (0, chatRoom_utils_1.chatRoomWhereOrInput)(uId),
        },
        select: {
            participants: {
                select: {
                    role: true,
                    userId: true,
                },
            },
        },
    });
    if (!room) {
        throw new error_1.RequestError(messages_1.NotFound.CHAT_ROOM, 404);
    }
    const participant = yield chat_models_1.ChatRoomParticipant.findUnique({
        where: {
            chatRoomId_userId: {
                chatRoomId: roomId,
                userId: uId,
            },
        },
    });
    // if (!participant) {
    // throw new RequestError("You are not participated in this group", 403);
    // }
    if (!(room === null || room === void 0 ? void 0 : room.participants.some((user) => (protectDelete ? user.role === "creator" : user.role !== "user") &&
        user.userId === uId)) ||
        !participant) {
        throw new error_1.ForbiddenError();
    }
    req.userRole = participant.role;
    next();
}));
exports.protectChatRoom = protectChatRoom;
const checkGroupVisibility = (params = "groupId") => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const groupId = Number((_a = req.params) === null || _a === void 0 ? void 0 : _a[params]);
    const { userId } = req;
    const uId = Number(userId);
    const participant = yield chat_models_1.ChatRoomParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: groupId, userId: uId } },
    });
    const isParticipated = participant !== null;
    const group = yield chat_models_1.ChatRoom.findUnique({
        where: { id: groupId, isGroupChat: true },
        select: { groupVisibility: true },
    });
    if (!group)
        throw new error_1.RequestError(messages_1.NotFound.GROUP_CHAT, 404);
    if (group.groupVisibility === "private" && !isParticipated)
        throw new error_1.ForbiddenError();
    return next();
});
exports.checkGroupVisibility = checkGroupVisibility;

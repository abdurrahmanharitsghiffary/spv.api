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
exports.getParticipant = exports.getChatRoomMessagesByRoomId = exports.getChatRoomParticipantsByRoomId = exports.getChatRoomById = exports.createChatRoom = void 0;
const chat_utils_1 = require("../utils/chat/chat.utils");
const chatRoom_utils_1 = require("../utils/chat/chatRoom.utils");
const response_1 = require("../utils/response");
const participants_utils_1 = require("../utils/participants.utils");
const paging_1 = require("../utils/paging");
const socket_utils_1 = require("../socket/socket.utils");
const event_1 = require("../socket/event");
const chat_models_1 = require("../models/chat.models");
const chat_1 = require("../lib/query/chat");
const user_1 = require("../lib/query/user");
const error_1 = require("../lib/error");
const messages_1 = require("../lib/messages");
const chat_normalize_1 = require("../utils/chat/chat.normalize");
const consts_1 = require("../lib/consts");
const createChatRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { participantId } = req.body;
    const createdRoom = yield (0, chatRoom_utils_1.createChatRoom)({
        participants: [{ id: Number(participantId), role: "admin" }],
        currentUserId: Number(userId),
    });
    createdRoom.participants.forEach((user) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(user.id, "USER"), event_1.Socket_Event.JOIN_ROOM, createdRoom);
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(createdRoom, 201, "Chat room created."));
});
exports.createChatRoom = createChatRoom;
const getChatRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { roomId } = req.params;
    const chatRoom = yield (0, chatRoom_utils_1.findChatRoomById)(Number(roomId), Number(userId));
    return res.status(200).json(new response_1.ApiResponse(chatRoom, 200));
});
exports.getChatRoomById = getChatRoomById;
const getChatRoomParticipantsByRoomId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { roomId } = req.params;
    let { limit = 20, offset = 0 } = req.query;
    limit = Number(limit);
    offset = Number(offset);
    const participants = yield (0, participants_utils_1.findParticipantsByRoomId)({
        roomId: Number(roomId),
        currentUserId: Number(userId),
        limit,
        offset,
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        data: participants.data,
        total_records: participants.total,
    }));
});
exports.getChatRoomParticipantsByRoomId = getChatRoomParticipantsByRoomId;
const getChatRoomMessagesByRoomId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { roomId } = req.params;
    let { limit = 20, offset = 0 } = req.query;
    limit = Number(limit);
    offset = Number(offset);
    const messages = yield (0, chat_utils_1.findMessageByRoomId)({
        roomId: Number(roomId),
        currentUserId: Number(userId),
        limit,
        offset,
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        data: messages.data,
        total_records: messages.total,
    }));
});
exports.getChatRoomMessagesByRoomId = getChatRoomMessagesByRoomId;
const getParticipant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { userId } = req;
    const { roomId, participantId } = req.params;
    const rId = Number(roomId);
    const pId = Number(participantId);
    const CUID = Number(userId);
    const room = yield chat_models_1.ChatRoom.findUnique({
        where: {
            id: rId,
        },
        select: {
            participants: {
                select: Object.assign({}, chat_1.selectRoomParticipant),
                where: {
                    userId: pId,
                    user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(CUID)), (0, user_1.excludeBlockingUser)(CUID)),
                },
            },
        },
    });
    if (!room)
        throw new error_1.RequestError(messages_1.NotFound.CHAT_ROOM, 404);
    if (!((_c = (_b = (_a = room.participants) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.id))
        throw new error_1.RequestError(messages_1.NotFound.USER, 404);
    const normalizedParticipant = yield (0, chat_normalize_1.normalizeChatParticipant)((_d = room.participants) === null || _d === void 0 ? void 0 : _d[0]);
    return res.status(200).json(new response_1.ApiResponse(normalizedParticipant, 200));
});
exports.getParticipant = getParticipant;

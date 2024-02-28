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
exports.findParticipantById = exports.findParticipantsByRoomId = exports.findNotUserRoleParticipant = void 0;
const error_1 = require("../lib/error");
const messages_1 = require("../lib/messages");
const chat_1 = require("../lib/query/chat");
const user_1 = require("../lib/query/user");
const chat_models_1 = require("../models/chat.models");
const chat_normalize_1 = require("./chat/chat.normalize");
const findNotUserRoleParticipant = (roomId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const participants = yield chat_models_1.ChatRoomParticipant.findMany({
        where: {
            role: { not: "user" },
            chatRoomId: roomId,
            userId: { not: userId },
        },
        select: { userId: true },
    });
    return participants;
});
exports.findNotUserRoleParticipant = findNotUserRoleParticipant;
const findParticipantsByRoomId = ({ roomId, currentUserId, limit, offset, }) => __awaiter(void 0, void 0, void 0, function* () {
    const participants = yield chat_models_1.ChatRoomParticipant.findMany({
        where: {
            chatRoomId: Number(roomId),
            AND: [
                {
                    user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(Number(currentUserId))), (0, user_1.excludeBlockingUser)(Number(currentUserId))),
                },
            ],
        },
        orderBy: [
            {
                role: "asc",
            },
            {
                user: { fullName: "asc" },
            },
        ],
        skip: offset,
        take: limit,
        select: chat_1.selectRoomParticipant,
    });
    const normalizedParticipants = yield Promise.all(participants.map((participant) => Promise.resolve((0, chat_normalize_1.normalizeChatParticipant)(participant))));
    const total = yield chat_models_1.ChatRoomParticipant.count({
        where: {
            chatRoomId: Number(roomId),
        },
    });
    return { data: normalizedParticipants, total };
});
exports.findParticipantsByRoomId = findParticipantsByRoomId;
const findParticipantById = ({ chatRoomId, userId, throwOnFound, error, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const participant = yield chat_models_1.ChatRoomParticipant.findUnique({
        where: {
            chatRoomId_userId: {
                chatRoomId,
                userId,
            },
        },
        select: chat_1.selectRoomParticipant,
    });
    if (!participant) {
        throw new error_1.RequestError(messages_1.NotFound.PARTICIPANT, 404);
    }
    if (throwOnFound) {
        throw new error_1.RequestError((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : "", (_b = error === null || error === void 0 ? void 0 : error.statusCode) !== null && _b !== void 0 ? _b : 400);
    }
    const normalizedParticipant = yield (0, chat_normalize_1.normalizeChatParticipant)(participant);
    return normalizedParticipant;
});
exports.findParticipantById = findParticipantById;

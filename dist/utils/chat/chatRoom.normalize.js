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
exports.normalizeChatRooms = void 0;
const chat_normalize_1 = require("./chat.normalize");
const normalizeChatRooms = (room) => new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
    return resolve({
        createdAt: room.createdAt,
        id: room.id,
        picture: room.groupPicture,
        isGroupChat: room.isGroupChat,
        messages: yield Promise.all(room.messages.map((message) => Promise.resolve((0, chat_normalize_1.normalizeChat)(message)))),
        unreadMessages: { total: room._count.messages },
        updatedAt: room.updatedAt,
        description: room.description,
        title: room.title,
        participants: {
            users: yield Promise.all(room.participants.map((participant) => Promise.resolve((0, chat_normalize_1.normalizeChatParticipant)(participant)))),
            total: room._count.participants,
        },
    });
}));
exports.normalizeChatRooms = normalizeChatRooms;

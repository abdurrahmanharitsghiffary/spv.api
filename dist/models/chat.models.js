"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadChat = exports.ChatRoomParticipant = exports.ChatRoom = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const Chat = prismaClient_1.default.chat;
const ChatRoom = prismaClient_1.default.chatRoom;
exports.ChatRoom = ChatRoom;
const ChatRoomParticipant = prismaClient_1.default.chatRoomParticipant;
exports.ChatRoomParticipant = ChatRoomParticipant;
const ReadChat = prismaClient_1.default.messageRead;
exports.ReadChat = ReadChat;
exports.default = Chat;

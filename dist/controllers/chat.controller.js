"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getMessagesById = exports.createChat = exports.updateChatById = exports.deleteChatById = exports.getAllChatsByUserId = void 0;
const chat_utils_1 = require("../utils/chat/chat.utils");
const paging_1 = require("../utils/paging");
const response_1 = require("../utils/response");
const socket_utils_1 = require("../socket/socket.utils");
const chat_normalize_1 = require("../utils/chat/chat.normalize");
const event_1 = require("../socket/event");
const chatRoom_utils_1 = require("../utils/chat/chatRoom.utils");
const consts_1 = require("../lib/consts");
const cloudinary_1 = __importStar(require("../lib/cloudinary"));
const getAllChatsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { limit = 20, offset = 0, type = "all", q } = req.query;
    const rooms = yield (0, chatRoom_utils_1.findAllUserChatRoom)({
        userId: Number(userId),
        limit: Number(limit),
        offset: Number(offset),
        type: type,
        q: q,
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: rooms.data,
        total_records: rooms.total,
        req,
    }));
});
exports.getAllChatsByUserId = getAllChatsByUserId;
const deleteChatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { messageId } = req.params;
    const deletedChat = yield (0, chat_utils_1.deleteChatById)(Number(messageId));
    const normalizedChat = yield (0, chat_normalize_1.normalizeChat)(deletedChat);
    deletedChat.chatRoom.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.userId, "USER"), event_1.Socket_Event.DELETE_MESSAGE, { chatId: normalizedChat.id, roomId: normalizedChat.roomId });
    });
    if (deletedChat.chatImage && deletedChat.chatImage.length > 0) {
        deletedChat.chatImage.forEach((image) => __awaiter(void 0, void 0, void 0, function* () {
            yield cloudinary_1.default.uploader.destroy(image.src);
        }));
    }
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Chat successfully deleted."));
});
exports.deleteChatById = deleteChatById;
const updateChatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    const { message } = req.body;
    const updatedChat = yield (0, chat_utils_1.updateChatById)(Number(messageId), message);
    const normalizedChat = yield (0, chat_normalize_1.normalizeChat)(updatedChat);
    updatedChat.chatRoom.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.userId, "USER"), event_1.Socket_Event.UPDATE_MESSAGE, normalizedChat);
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Chat successfully updated."));
});
exports.updateChatById = updateChatById;
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { message, chatRoomId } = req.body;
    const cRId = Number(chatRoomId);
    const uId = Number(userId);
    const images = (0, cloudinary_1.getCloudinaryImage)(req);
    const createdChat = yield (0, chat_utils_1.createChatWithRoomIdAndAuthorId)({
        senderId: uId,
        message,
        chatRoomId: cRId,
        images: images,
    });
    const normalizedChat = yield (0, chat_normalize_1.normalizeChat)(createdChat);
    createdChat.chatRoom.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.userId, "USER"), event_1.Socket_Event.RECEIVE_MESSAGE, normalizedChat);
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(normalizedChat, 201, "Chat successfully created."));
});
exports.createChat = createChat;
const getMessagesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    const { userId } = req;
    const message = yield (0, chat_utils_1.findMessageById)(Number(messageId));
    return res.status(200).json(new response_1.ApiResponse(message, 200));
});
exports.getMessagesById = getMessagesById;

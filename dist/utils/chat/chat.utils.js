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
exports.checkIsMessageFound = exports.updateChatById = exports.deleteChatById = exports.createChatWithRoomIdAndAuthorId = exports.findChatByParticipantIds = exports.findMessageById = exports.findMessageByRoomId = void 0;
const error_1 = require("../../lib/error");
const chat_1 = require("../../lib/query/chat");
const user_1 = require("../../lib/query/user");
const chat_models_1 = __importDefault(require("../../models/chat.models"));
const chat_normalize_1 = require("./chat.normalize");
const chat_models_2 = require("../../models/chat.models");
const messages_1 = require("../../lib/messages");
const prismaClient_1 = __importDefault(require("../../config/prismaClient"));
const selectChatRoomParticipants = {
    chatRoom: {
        select: {
            participants: {
                select: {
                    userId: true,
                },
            },
        },
    },
};
const chatWhereAndInput = (currentUserId) => [
    {
        author: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
    },
];
const findMessageByRoomId = ({ roomId, limit = 20, offset = 0, }) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield chat_models_1.default.findMany({
        where: {
            chatRoomId: roomId,
        },
        select: Object.assign({}, chat_1.selectChat),
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        skip: offset,
    });
    const totalMessages = yield chat_models_1.default.count({
        where: {
            chatRoomId: roomId,
        },
    });
    return {
        data: yield Promise.all(messages.map((msg) => Promise.resolve((0, chat_normalize_1.normalizeChat)(msg)))),
        total: totalMessages,
    };
});
exports.findMessageByRoomId = findMessageByRoomId;
const findMessageById = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_models_1.default.findUnique({
        where: {
            id: chatId,
        },
        select: chat_1.selectChat,
    });
    if (!chat)
        throw new error_1.RequestError(messages_1.NotFound.MESSAGE, 404);
    const normalizedChat = yield (0, chat_normalize_1.normalizeChat)(chat);
    return normalizedChat;
});
exports.findMessageById = findMessageById;
const findChatByParticipantIds = ({ limit, offset, participantsId, currentUserId, isGroupChat = false, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const chats = yield chat_models_2.ChatRoom.findFirst({
        where: {
            isGroupChat,
            participants: {
                every: {
                    userId: {
                        in: [...participantsId, currentUserId],
                    },
                },
            },
            AND: [
                {
                    participants: {
                        every: {
                            user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
                        },
                    },
                },
            ],
        },
        select: {
            _count: {
                select: {
                    messages: true,
                },
            },
            messages: {
                select: Object.assign({}, chat_1.selectChat),
                where: {
                    AND: chatWhereAndInput(currentUserId),
                },
                skip: offset,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
    if (!chats)
        throw new error_1.RequestError(messages_1.NotFound.MESSAGE, 404);
    return {
        data: yield Promise.all(((_a = chats === null || chats === void 0 ? void 0 : chats.messages) !== null && _a !== void 0 ? _a : []).map((chat) => Promise.resolve((0, chat_normalize_1.normalizeChat)(chat)))),
        total: (_c = (_b = chats === null || chats === void 0 ? void 0 : chats._count) === null || _b === void 0 ? void 0 : _b.messages) !== null && _c !== void 0 ? _c : 0,
    };
});
exports.findChatByParticipantIds = findChatByParticipantIds;
const createChatWithRoomIdAndAuthorId = (createOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatRoomId, senderId, message, images } = createOptions;
    return yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const createdChat = yield tx.chat.create({
            data: {
                chatRoomId,
                authorId: senderId,
                message,
            },
            select: Object.assign(Object.assign({}, chat_1.selectChat), { chatRoom: {
                    select: {
                        isGroupChat: true,
                        participants: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                } }),
        });
        if (images && images.length > 0) {
            yield tx.image.createMany({
                data: images.map((src) => ({ chatId: createdChat.id, src })),
            });
            createdChat.chatImage = images.map((src) => ({ src }));
        }
        return createdChat;
    }));
});
exports.createChatWithRoomIdAndAuthorId = createChatWithRoomIdAndAuthorId;
const deleteChatById = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.checkIsMessageFound)({ messageId: chatId });
    return yield chat_models_1.default.delete({
        where: {
            id: chatId,
        },
        select: Object.assign(Object.assign({}, chat_1.selectChat), { chatRoom: {
                select: Object.assign({ isGroupChat: true }, selectChatRoomParticipants.chatRoom.select),
            } }),
    });
});
exports.deleteChatById = deleteChatById;
const updateChatById = (chatId, message) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.checkIsMessageFound)({ messageId: chatId });
    return yield chat_models_1.default.update({
        where: {
            id: chatId,
        },
        data: {
            message,
        },
        select: Object.assign(Object.assign({}, chat_1.selectChat), { chatRoom: {
                select: Object.assign({ isGroupChat: true }, selectChatRoomParticipants.chatRoom.select),
            } }),
    });
});
exports.updateChatById = updateChatById;
const checkIsMessageFound = ({ customMessage, messageId, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const message = yield chat_models_1.default.findUnique({
        where: {
            id: messageId,
        },
        select: { id: true },
    });
    if (!message)
        throw new error_1.RequestError((_d = customMessage === null || customMessage === void 0 ? void 0 : customMessage.message) !== null && _d !== void 0 ? _d : messages_1.NotFound.MESSAGE, (_e = customMessage === null || customMessage === void 0 ? void 0 : customMessage.statusCode) !== null && _e !== void 0 ? _e : 404);
    return message;
});
exports.checkIsMessageFound = checkIsMessageFound;

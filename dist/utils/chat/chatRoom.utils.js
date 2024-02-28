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
exports.isChatRoomFound = exports.createChatRoom = exports.findAllUserChatRoom = exports.findChatRoomById = exports.chatRoomWhereOrInput = void 0;
const user_1 = require("../../lib/query/user");
const chat_models_1 = require("../../models/chat.models");
const chat_1 = require("../../lib/query/chat");
const error_1 = require("../../lib/error");
const chatRoom_normalize_1 = require("./chatRoom.normalize");
const prismaClient_1 = __importDefault(require("../../config/prismaClient"));
const user_utils_1 = require("../user/user.utils");
const code_1 = require("../../lib/code");
const user_models_1 = __importDefault(require("../../models/user.models"));
const messages_1 = require("../../lib/messages");
const chatRoomWhereOrInput = (currentUserId) => [
    {
        isGroupChat: false,
        participants: {
            every: {
                user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
            },
        },
    },
    {
        isGroupChat: true,
        participants: {
            some: {
                user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
            },
        },
    },
];
exports.chatRoomWhereOrInput = chatRoomWhereOrInput;
const findChatRoomById = (id, currentUserId, opt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const chatRoom = yield chat_models_1.ChatRoom.findUnique({
        where: {
            id,
            OR: (0, exports.chatRoomWhereOrInput)(currentUserId),
        },
        select: (0, chat_1.selectChatRoomWithWhereInput)(currentUserId),
    });
    if (!chatRoom)
        throw new error_1.RequestError((_a = opt === null || opt === void 0 ? void 0 : opt.message) !== null && _a !== void 0 ? _a : messages_1.NotFound.CHAT_ROOM, (_b = opt === null || opt === void 0 ? void 0 : opt.statusCode) !== null && _b !== void 0 ? _b : 404);
    const normalizedRoom = yield (0, chatRoom_normalize_1.normalizeChatRooms)(chatRoom);
    return normalizedRoom;
});
exports.findChatRoomById = findChatRoomById;
const findAllUserChatRoom = ({ userId, limit, offset, type = "all", q, }) => __awaiter(void 0, void 0, void 0, function* () {
    const groupFilter = type === "group" ? true : type === "personal" ? false : undefined;
    const filter = () => ({
        AND: [
            {
                participants: {
                    some: {
                        userId: {
                            in: [userId],
                        },
                    },
                },
            },
        ],
        OR: [
            {
                isGroupChat: false,
                participants: {
                    some: {
                        AND: [
                            {
                                user: {
                                    fullName: {
                                        contains: q,
                                    },
                                    id: {
                                        not: userId,
                                    },
                                },
                            },
                        ],
                    },
                },
                AND: [
                    {
                        participants: {
                            every: {
                                user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(userId)), (0, user_1.excludeBlockingUser)(userId)),
                            },
                        },
                    },
                ],
            },
            {
                isGroupChat: true,
                AND: [
                    { title: { contains: q } },
                    {
                        participants: {
                            some: {
                                user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(userId)), (0, user_1.excludeBlockingUser)(userId)),
                            },
                        },
                    },
                ],
            },
        ],
    });
    const rooms = yield chat_models_1.ChatRoom.findMany({
        where: Object.assign({ isGroupChat: groupFilter }, filter()),
        skip: offset,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        select: (0, chat_1.selectChatRoomWithWhereInput)(userId),
    });
    const totalRooms = yield chat_models_1.ChatRoom.count({
        where: Object.assign({ isGroupChat: groupFilter }, filter()),
    });
    const chatRoom = yield Promise.all(rooms.map((room) => Promise.resolve((0, chatRoom_normalize_1.normalizeChatRooms)(room))));
    return { data: chatRoom, total: totalRooms };
});
exports.findAllUserChatRoom = findAllUserChatRoom;
const createChatRoom = ({ participants = [], currentUserId, isGroupChat = false, description, title, imageSrc, visibility, applyType, }) => __awaiter(void 0, void 0, void 0, function* () {
    participants = participants
        .map((item) => (Object.assign(Object.assign({}, item), { id: Number(item.id) })))
        .filter((item) => !isNaN(item.id));
    console.log(participants, "Participants");
    const isUserIncludedInFields = participants.some((item) => item.id === currentUserId);
    if (isUserIncludedInFields) {
        throw new error_1.RequestError("participants field should not contain the group chat creator (it will be automatically added as creator).", 400);
    }
    let errors = [];
    yield Promise.all(participants.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_models_1.default.findUnique({
            where: {
                id: item.id,
                AND: (0, user_utils_1.userWhereAndInput)(currentUserId),
            },
            select: {
                id: true,
            },
        });
        if (!user) {
            errors.push({
                message: messages_1.NotFound.USER,
                id: item.id,
                code: code_1.Code.NOT_FOUND,
            });
        }
    })));
    if (errors.length > 0)
        throw new error_1.RequestError("Not found", 404, errors, "create_chat_room");
    return yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!isGroupChat) {
            const chatRoomIsExist = yield tx.chatRoom.findFirst({
                where: {
                    isGroupChat: false,
                    participants: {
                        every: {
                            userId: {
                                in: [
                                    ...participants.map((participant) => participant.id),
                                    currentUserId,
                                ],
                            },
                        },
                    },
                },
            });
            if (chatRoomIsExist) {
                throw new error_1.RequestError("Chat room already created.", 409);
            }
        }
        const chatRoom = yield tx.chatRoom.create({
            data: {
                isGroupChat,
                description,
                title,
                groupVisibility: isGroupChat ? visibility !== null && visibility !== void 0 ? visibility : "public" : "private",
                applyType: isGroupChat ? applyType !== null && applyType !== void 0 ? applyType : "public" : "private",
                participants: {
                    createMany: {
                        skipDuplicates: true,
                        data: [
                            ...participants.map((item) => {
                                var _a;
                                return ({
                                    userId: item.id,
                                    role: isGroupChat
                                        ? (_a = item.role) !== null && _a !== void 0 ? _a : "user"
                                        : "creator",
                                });
                            }),
                            {
                                userId: currentUserId,
                                role: "creator",
                            },
                        ],
                    },
                },
            },
            select: Object.assign({}, (0, chat_1.selectChatRoomPWL)(currentUserId)),
        });
        if (imageSrc) {
            yield tx.image.create({
                data: {
                    groupId: chatRoom.id,
                    src: imageSrc,
                },
            });
        }
        const normalizedRoom = yield (0, chatRoom_normalize_1.normalizeChatRooms)(chatRoom);
        return normalizedRoom;
    }));
});
exports.createChatRoom = createChatRoom;
const isChatRoomFound = ({ chatRoomId, currentUserId, customMessage, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const orInput = currentUserId
        ? (0, exports.chatRoomWhereOrInput)(currentUserId)
        : undefined;
    const chatRoom = yield chat_models_1.ChatRoom.findUnique({
        where: {
            id: chatRoomId,
            OR: orInput,
        },
        select: { id: true, applyType: true },
    });
    if (!chatRoom)
        throw new error_1.RequestError((_c = customMessage === null || customMessage === void 0 ? void 0 : customMessage.message) !== null && _c !== void 0 ? _c : messages_1.NotFound.CHAT_ROOM, (_d = customMessage === null || customMessage === void 0 ? void 0 : customMessage.statusCode) !== null && _d !== void 0 ? _d : 404);
    return chatRoom;
});
exports.isChatRoomFound = isChatRoomFound;

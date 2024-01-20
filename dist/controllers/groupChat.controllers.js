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
exports.deleteGroupParticipants = exports.updateGroupChatParticipants = exports.deleteGroupChat = exports.updateGroupChat = exports.leaveGroupChat = exports.joinGroupChat = exports.createGroupChat = void 0;
const chatRoom_utils_1 = require("../utils/chat/chatRoom.utils");
const response_1 = require("../utils/response");
const chat_models_1 = require("../models/chat.models");
const chat_1 = require("../lib/query/chat");
const user_1 = require("../lib/query/user");
const socket_utils_1 = require("../socket/socket.utils");
const event_1 = require("../socket/event");
const chatRoom_normalize_1 = require("../utils/chat/chatRoom.normalize");
const error_1 = require("../lib/error");
const image_models_1 = __importDefault(require("../models/image.models"));
const utils_1 = require("../utils");
const messages_1 = require("../lib/messages");
const chat_normalize_1 = require("../utils/chat/chat.normalize");
const consts_1 = require("../lib/consts");
const createGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { participants, description, title } = req.body;
    const image = req.file;
    const createdGroupChat = yield (0, chatRoom_utils_1.createChatRoom)({
        isGroupChat: true,
        participants: participants,
        currentUserId: Number(userId),
        description,
        title,
        image,
    });
    createdGroupChat.participants.users.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.id, "USER"), event_1.Socket_Event.JOIN_ROOM, createdGroupChat);
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(createdGroupChat, 201, "Group chat created successfully."));
});
exports.createGroupChat = createGroupChat;
const joinGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { userId } = req;
    const gId = Number(groupId);
    const uId = Number(userId);
    yield (0, chatRoom_utils_1.findChatRoomById)(gId, uId, {
        message: messages_1.NotFound.GROUP_CHAT,
        statusCode: 404,
    });
    const participant = yield chat_models_1.ChatRoomParticipant.findUnique({
        where: {
            chatRoomId_userId: {
                chatRoomId: gId,
                userId: uId,
            },
        },
    });
    if (participant) {
        throw new error_1.RequestError("You already participated in the group.", 400);
    }
    const joinedRoom = yield chat_models_1.ChatRoomParticipant.create({
        data: {
            chatRoomId: gId,
            userId: uId,
            role: "user",
        },
        select: {
            role: true,
            user: {
                select: user_1.selectUserSimplified,
            },
            chatRoomId: true,
            createdAt: true,
            chatRoom: { select: (0, chat_1.selectChatRoomPWL)(uId) },
        },
    });
    joinedRoom.chatRoom.participants.forEach((participant) => __awaiter(void 0, void 0, void 0, function* () {
        const normalizedRoom = yield (0, chatRoom_normalize_1.normalizeChatRooms)(joinedRoom.chatRoom);
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.user.id, "USER"), event_1.Socket_Event.JOIN_ROOM, normalizedRoom);
    }));
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Group chat joined successfully."));
});
exports.joinGroupChat = joinGroupChat;
const leaveGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { userId } = req;
    const gId = Number(groupId);
    const uId = Number(userId);
    const group = yield chat_models_1.ChatRoom.findUnique({ where: { id: gId } });
    if (!group)
        throw new error_1.RequestError(messages_1.NotFound.GROUP_CHAT, 404);
    const paticipatedMember = yield chat_models_1.ChatRoomParticipant.findUnique({
        where: {
            chatRoomId_userId: {
                userId: uId,
                chatRoomId: gId,
            },
        },
    });
    if (!paticipatedMember) {
        throw new error_1.RequestError("You are not participated in group.", 409);
    }
    const joinedRoom = yield chat_models_1.ChatRoomParticipant.delete({
        where: {
            chatRoomId_userId: {
                userId: paticipatedMember.userId,
                chatRoomId: gId,
            },
        },
        select: {
            role: true,
            user: {
                select: user_1.selectUserSimplified,
            },
            chatRoomId: true,
            createdAt: true,
            chatRoom: { select: (0, chat_1.selectChatRoomPWL)(uId) },
        },
    });
    const normalizedRoom = yield (0, chatRoom_normalize_1.normalizeChatRooms)(joinedRoom.chatRoom);
    joinedRoom.chatRoom.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.user.id, "USER"), event_1.Socket_Event.LEAVE_ROOM, { roomId: normalizedRoom.id, userId: uId });
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Successfully leave group chat."));
});
exports.leaveGroupChat = leaveGroupChat;
const updateGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req;
    const { groupId } = req.params;
    const image = req.file;
    const { userRole } = req;
    let { participants = [], description, title } = req.body;
    const gId = Number(groupId);
    participants = participants.map((p) => (Object.assign(Object.assign({}, p), { id: Number(p.id) })));
    yield (0, utils_1.checkParticipants)(participants, gId, userRole);
    const selectRoom = (0, chat_1.selectChatRoomPWL)(Number(userId));
    const updatedChatRoom = yield chat_models_1.ChatRoom.update({
        where: {
            id: gId,
            isGroupChat: true,
        },
        data: {
            description,
            title,
            participants: {
                upsert: [
                    ...participants.map((item) => ({
                        create: {
                            role: item.role,
                            userId: item.id,
                        },
                        update: {
                            role: item.role,
                        },
                        where: {
                            chatRoomId_userId: {
                                chatRoomId: gId,
                                userId: item.id,
                            },
                        },
                    })),
                ],
            },
        },
        select: Object.assign(Object.assign({}, selectRoom), { messages: Object.assign(Object.assign({}, selectRoom.messages), { take: 10 }) }),
    });
    console.log(updatedChatRoom, "updated");
    if (image) {
        yield image_models_1.default.upsert({
            create: {
                src: (0, utils_1.getFileDest)(image),
                groupId: updatedChatRoom.id,
            },
            where: {
                groupId: updatedChatRoom.id,
            },
            update: {
                src: (0, utils_1.getFileDest)(image),
            },
        });
        if ((_a = updatedChatRoom.groupPicture) === null || _a === void 0 ? void 0 : _a.src) {
            yield (0, utils_1.deleteUploadedImage)(updatedChatRoom.groupPicture.src);
        }
    }
    const normalizedRoom = yield (0, chatRoom_normalize_1.normalizeChatRooms)(updatedChatRoom);
    updatedChatRoom.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.user.id, "USER"), event_1.Socket_Event.UPDATE_ROOM, {
            updating: "details",
            data: normalizedRoom,
        });
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Chat room successfully updated."));
});
exports.updateGroupChat = updateGroupChat;
const deleteGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { groupId } = req.params;
    const deletedRoom = yield chat_models_1.ChatRoom.delete({
        where: {
            id: Number(groupId),
            isGroupChat: true,
        },
        include: {
            participants: {
                select: { userId: true },
            },
            groupPicture: {
                select: {
                    src: true,
                },
            },
        },
    });
    if ((_b = deletedRoom.groupPicture) === null || _b === void 0 ? void 0 : _b.src) {
        yield (0, utils_1.deleteUploadedImage)(deletedRoom.groupPicture.src);
    }
    deletedRoom.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.userId, "USER"), event_1.Socket_Event.DELETE_ROOM, deletedRoom.id);
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Chat room successfully deleted."));
});
exports.deleteGroupChat = deleteGroupChat;
const updateGroupChatParticipants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const { participants } = req.body;
    const { userRole } = req;
    const rId = Number(roomId);
    yield (0, utils_1.checkParticipants)(participants, rId, userRole);
    console.log(participants, "Participants");
    const updatedGroupChat = yield chat_models_1.ChatRoom.update({
        where: {
            id: rId,
        },
        data: {
            participants: {
                upsert: [
                    ...participants.map((item) => ({
                        create: {
                            role: item.role,
                            userId: item.id,
                        },
                        update: {
                            role: item.role,
                        },
                        where: {
                            chatRoomId_userId: {
                                chatRoomId: rId,
                                userId: item.id,
                            },
                        },
                    })),
                ],
            },
        },
        select: {
            participants: {
                select: {
                    userId: true,
                },
            },
        },
    });
    const updatedParticipants = yield chat_models_1.ChatRoomParticipant.findMany({
        where: {
            chatRoomId: rId,
            OR: participants.map((participant) => ({
                userId: participant.id,
            })),
        },
        select: Object.assign({}, chat_1.selectRoomParticipant),
    });
    const normalizedParticipants = yield Promise.all(updatedParticipants.map((participant) => Promise.resolve((0, chat_normalize_1.normalizeChatParticipant)(participant))));
    updatedGroupChat.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.userId, "USER"), event_1.Socket_Event.UPDATE_ROOM, {
            updating: "participants",
            roomId: rId,
            data: normalizedParticipants,
        });
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Participants successfully added into the group."));
});
exports.updateGroupChatParticipants = updateGroupChatParticipants;
const deleteGroupParticipants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const { userRole, userId } = req;
    const { ids } = req.body;
    const rId = Number(roomId);
    yield (0, utils_1.checkParticipants)(ids, rId, userRole, true);
    const chatRoomAfterDeletingParticipants = yield chat_models_1.ChatRoom.update({
        where: {
            id: rId,
        },
        data: {
            participants: {
                deleteMany: [...ids.map((id) => ({ userId: id }))],
            },
        },
        select: {
            participants: {
                select: {
                    userId: true,
                },
            },
        },
    });
    chatRoomAfterDeletingParticipants.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.userId, "USER"), event_1.Socket_Event.UPDATE_ROOM, {
            updating: "delete-participants",
            roomId: rId,
            data: ids,
        });
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Participants successfully removed from the group."));
});
exports.deleteGroupParticipants = deleteGroupParticipants;

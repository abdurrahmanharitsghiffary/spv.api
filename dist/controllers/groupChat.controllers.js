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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupMembershipRequestById = exports.deleteMembershipRequest = exports.getMembershipRequests = exports.rejectGroupChatApplicationRequest = exports.approveGroupChatApplicationRequest = exports.getGroupChatApplicationRequest = exports.requestGroupChatApplication = exports.addGroupParticipants = exports.deleteGroupParticipants = exports.updateGroupChatParticipants = exports.deleteGroupChat = exports.updateGroupChat = exports.leaveGroupChat = exports.joinGroupChat = exports.createGroupChat = void 0;
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
const cloudinary_1 = __importStar(require("../lib/cloudinary"));
const apply_models_1 = __importDefault(require("../models/apply.models"));
const app_request_1 = require("../lib/query/app-request");
const paging_1 = require("../utils/paging");
const notification_utils_1 = require("../utils/notification/notification.utils");
const app_request_normalize_1 = require("../utils/app-request/app-request.normalize");
const participants_utils_1 = require("../utils/participants.utils");
const createGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req;
    const { participants, description, title, applyType, groupVisibility } = req.body;
    const imageSrc = (_a = (0, cloudinary_1.getCloudinaryImage)(req)) === null || _a === void 0 ? void 0 : _a[0];
    const uId = Number(userId);
    const createdGroupChat = yield (0, chatRoom_utils_1.createChatRoom)({
        isGroupChat: true,
        applyType,
        visibility: groupVisibility,
        participants: participants,
        currentUserId: uId,
        description,
        title,
        imageSrc,
    });
    createdGroupChat.participants.forEach((participant) => {
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
    const cht = yield (0, chatRoom_utils_1.isChatRoomFound)({
        customMessage: {
            message: messages_1.NotFound.GROUP_CHAT,
            statusCode: 404,
        },
        chatRoomId: gId,
        currentUserId: uId,
    });
    if (cht.applyType === "private")
        throw new error_1.RequestError("You must send application request to join this group.", 403);
    const participant = yield chat_models_1.ChatRoomParticipant.findUnique({
        where: {
            chatRoomId_userId: {
                chatRoomId: gId,
                userId: uId,
            },
        },
    });
    if (participant) {
        throw new error_1.RequestError(consts_1.errorsMessage.ALREADY_JOIN_G, 409);
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
    const normalizedRoom = yield (0, chatRoom_normalize_1.normalizeChatRooms)(joinedRoom.chatRoom);
    joinedRoom.chatRoom.participants.forEach((participant) => __awaiter(void 0, void 0, void 0, function* () {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.user.id, "USER"), event_1.Socket_Event.JOIN_ROOM, normalizedRoom);
    }));
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Successfully join into the group chat."));
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
    var _b, _c, _d;
    const { userId } = req;
    const { groupId } = req.params;
    const imageSrc = (_b = (0, cloudinary_1.getCloudinaryImage)(req)) === null || _b === void 0 ? void 0 : _b[0];
    let { description, title, groupVisibility, applyType } = req.body;
    const gId = Number(groupId);
    const uId = Number(userId);
    const selectRoom = (0, chat_1.selectChatRoomPWL)(uId);
    const updatedChatRoom = yield chat_models_1.ChatRoom.update({
        where: {
            id: gId,
            isGroupChat: true,
        },
        data: {
            groupVisibility,
            applyType: applyType,
            description,
            title,
        },
        select: Object.assign(Object.assign({}, selectRoom), { messages: Object.assign(Object.assign({}, selectRoom.messages), { take: 10 }) }),
    });
    if (imageSrc) {
        yield image_models_1.default.upsert({
            create: {
                src: imageSrc,
                groupId: updatedChatRoom.id,
            },
            where: {
                groupId: updatedChatRoom.id,
            },
            update: {
                src: imageSrc,
            },
        });
        if ((_c = updatedChatRoom.groupPicture) === null || _c === void 0 ? void 0 : _c.src) {
            yield cloudinary_1.default.uploader.destroy((_d = updatedChatRoom.groupPicture) === null || _d === void 0 ? void 0 : _d.src);
        }
    }
    const normalizedRoom = yield (0, chatRoom_normalize_1.normalizeChatRooms)(updatedChatRoom);
    updatedChatRoom.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.user.id, "USER"), event_1.Socket_Event.UPDATE_ROOM, {
            data: normalizedRoom,
        });
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Chat room successfully updated."));
});
exports.updateGroupChat = updateGroupChat;
const deleteGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { userId } = req;
    const { groupId } = req.params;
    const uId = Number(userId);
    const gId = Number(groupId);
    const deletedRoom = yield chat_models_1.ChatRoom.delete({
        where: {
            id: gId,
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
    if ((_e = deletedRoom.groupPicture) === null || _e === void 0 ? void 0 : _e.src) {
        yield cloudinary_1.default.uploader.destroy(deletedRoom.groupPicture.src);
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
    const { groupId } = req.params;
    const { participants } = req.body;
    const { userRole, userId } = req;
    const gId = Number(groupId);
    const uId = Number(userId);
    yield (0, utils_1.checkParticipants)({
        participants,
        groupId: gId,
        currentUserId: uId,
    });
    const updatedGroupChat = yield chat_models_1.ChatRoom.update({
        where: {
            id: gId,
        },
        data: {
            participants: {
                update: [
                    ...participants.map((item) => ({
                        // create: {
                        //   role: item.role,
                        //   userId: item.id,
                        // },
                        data: {
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
            chatRoomId: gId,
            userId: { in: participants.map((p) => p.id) },
        },
        select: Object.assign({}, chat_1.selectRoomParticipant),
    });
    const normalizedParticipants = yield Promise.all(updatedParticipants.map((participant) => Promise.resolve((0, chat_normalize_1.normalizeChatParticipant)(participant))));
    updatedGroupChat.participants.forEach((participant) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.userId, "USER"), event_1.Socket_Event.UPDATE_PARTICIPANTS, {
            roomId: gId,
            data: normalizedParticipants,
        });
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Participants successfully added into the group."));
});
exports.updateGroupChatParticipants = updateGroupChatParticipants;
const deleteGroupParticipants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { userRole, userId } = req;
    const { ids } = req.body;
    const gId = Number(groupId);
    const uId = Number(userId);
    yield (0, utils_1.checkParticipants)({
        participants: ids,
        groupId: gId,
        currentUserId: uId,
        isDeleting: true,
    });
    const chatRoomAfterDeletingParticipants = yield chat_models_1.ChatRoom.update({
        where: {
            id: gId,
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
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(participant.userId, "USER"), event_1.Socket_Event.DELETE_PARTICIPANTS, {
            roomId: gId,
            data: ids,
        });
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Participants successfully removed from the group."));
});
exports.deleteGroupParticipants = deleteGroupParticipants;
const addGroupParticipants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, userRole } = req;
    const { groupId } = req.params;
    const { ids } = req.body;
    const userIds = ids;
    const uId = Number(userId);
    const gId = Number(groupId);
    yield (0, utils_1.checkParticipants)({
        participants: ids,
        groupId: gId,
        currentUserId: uId,
    });
    const updatedGroup = yield chat_models_1.ChatRoom.update({
        where: { isGroupChat: true, id: gId },
        data: {
            participants: {
                createMany: {
                    skipDuplicates: true,
                    data: userIds.map((id) => ({ role: "user", userId: id })),
                },
            },
        },
        select: (0, chat_1.selectChatRoom)(uId),
    });
    const chatParticipants = yield chat_models_1.ChatRoomParticipant.findMany({
        where: { chatRoomId: gId },
        select: {
            userId: true,
        },
    });
    const newParticipants = yield chat_models_1.ChatRoomParticipant.findMany({
        where: { chatRoomId: gId, userId: { in: userIds } },
        select: Object.assign({}, chat_1.selectRoomParticipant),
    });
    const normalizedNewParticipants = yield Promise.all(newParticipants.map((p) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, chat_normalize_1.normalizeChatParticipant)(p); })));
    chatParticipants.forEach((p) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(p.userId, "USER"), event_1.Socket_Event.ADD_PARTICIPANTS, { roomId: gId, data: normalizedNewParticipants });
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(updatedGroup, 201, "Successfully added users to group."));
});
exports.addGroupParticipants = addGroupParticipants;
const requestGroupChatApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { comment } = req.body;
    const { userId } = req;
    const gId = Number(groupId);
    const uId = Number(userId);
    const cht = yield (0, chatRoom_utils_1.isChatRoomFound)({ chatRoomId: gId, currentUserId: uId });
    if ((cht === null || cht === void 0 ? void 0 : cht.applyType) !== "private")
        throw new error_1.RequestError("This group allows you to join without sending membership request.", 400);
    const participant = yield chat_models_1.ChatRoomParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: gId, userId: uId } },
        select: { userId: true },
    });
    if (participant === null || participant === void 0 ? void 0 : participant.userId)
        throw new error_1.RequestError("You already participated in this group.", 409);
    const pendingRequest = yield apply_models_1.default.findFirst({
        where: { groupId: gId, userId: uId, status: "PENDING" },
    });
    if (pendingRequest) {
        throw new error_1.RequestError("You already have a pending membership request. Please wait until the request is either approved or rejected.", 409);
    }
    const notUserRoleParticipants = yield (0, participants_utils_1.findNotUserRoleParticipant)(gId, uId);
    const applyRequest = yield apply_models_1.default.create({
        data: { groupId: gId, userId: uId, type: "group_chat", comment },
        select: Object.assign({}, app_request_1.selectGroupMembershipRequest),
    });
    const normalizedAprq = yield (0, app_request_normalize_1.normalizeMembershipRequest)(applyRequest);
    notUserRoleParticipants.forEach((p) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(p.userId, "USER"), event_1.Socket_Event.RECEIVE_GAR, { data: normalizedAprq, roomId: gId, userId: p.userId });
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(normalizedAprq, 201, "Membership request has been sent."));
});
exports.requestGroupChatApplication = requestGroupChatApplication;
const getGroupChatApplicationRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, offset } = (0, paging_1.parsePaging)(req);
    const { type } = req.query;
    const { groupId } = req.params;
    const gId = Number(groupId);
    const statusFilter = type === "all" ? undefined : type === null || type === void 0 ? void 0 : type.toString().toUpperCase();
    const appRequests = yield apply_models_1.default.findMany({
        where: { groupId: gId, type: "group_chat", status: statusFilter },
        select: Object.assign({}, app_request_1.selectGroupMembershipRequest),
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
    });
    const normalizedRequests = yield Promise.all(appRequests.map((r) => Promise.resolve((0, app_request_normalize_1.normalizeMembershipRequest)(r))));
    const total = yield apply_models_1.default.count({
        where: { groupId: gId, type: "group_chat", status: statusFilter },
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        data: normalizedRequests,
        total_records: total,
    }));
});
exports.getGroupChatApplicationRequest = getGroupChatApplicationRequest;
const approveGroupChatApplicationRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { groupId, requestId } = req.params;
    const gId = Number(groupId);
    const uId = Number(userId);
    const rId = Number(requestId);
    const apRq = yield apply_models_1.default.findUnique({
        where: {
            id: rId,
            type: "group_chat",
        },
    });
    const chatParticipants = yield chat_models_1.ChatRoomParticipant.findMany({
        where: { chatRoomId: gId },
        select: { userId: true },
    });
    const notRoleUserParticipants = yield (0, participants_utils_1.findNotUserRoleParticipant)(gId, uId);
    if (!apRq)
        throw new error_1.RequestError(messages_1.NotFound.APRQ, 404);
    const p = yield chat_models_1.ChatRoomParticipant.findUnique({
        where: { chatRoomId_userId: { chatRoomId: gId, userId: apRq.userId } },
    });
    if (p)
        throw new error_1.RequestError("User already a member of this group.", 409);
    if (apRq.status === "APPROVED")
        throw new error_1.RequestError(consts_1.errorsMessage.APRQ_ALREADY_A, 409);
    if (apRq.status === "REJECTED")
        throw new error_1.RequestError(consts_1.errorsMessage.APRQ_ALREADY_R, 409);
    const newParticipant = yield chat_models_1.ChatRoomParticipant.create({
        data: { role: "user", userId: apRq.userId, chatRoomId: gId },
        select: Object.assign({}, chat_1.selectRoomParticipant),
    });
    const normalizedNewParticipant = yield (0, chat_normalize_1.normalizeChatParticipant)(newParticipant);
    yield apply_models_1.default.update({
        where: {
            id: rId,
            type: "group_chat",
        },
        data: { status: "APPROVED" },
    });
    notRoleUserParticipants.forEach((p) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(p.userId, "USER"), event_1.Socket_Event.APPROVE_GAR, {
            requestId: rId,
            roomId: gId,
        });
    });
    chatParticipants.forEach((p) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(p.userId, "USER"), event_1.Socket_Event.ADD_PARTICIPANTS, { roomId: gId, data: [normalizedNewParticipant] });
    });
    yield (0, notification_utils_1.notify)(req, {
        groupId: gId,
        type: "accepted_group_application",
        receiverId: apRq.userId,
        userId: uId,
    });
    return res
        .status(200)
        .json(new response_1.ApiResponse(null, 200, "User successfully added into the group."));
});
exports.approveGroupChatApplicationRequest = approveGroupChatApplicationRequest;
const rejectGroupChatApplicationRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { groupId, requestId } = req.params;
    const gId = Number(groupId);
    const uId = Number(userId);
    const rId = Number(requestId);
    const apRq = yield apply_models_1.default.findUnique({
        where: {
            id: rId,
            type: "group_chat",
        },
    });
    if (!apRq)
        throw new error_1.RequestError(messages_1.NotFound.APRQ, 404);
    if (apRq.status === "APPROVED")
        throw new error_1.RequestError(consts_1.errorsMessage.APRQ_ALREADY_A, 409);
    if (apRq.status === "REJECTED")
        throw new error_1.RequestError(consts_1.errorsMessage.APRQ_ALREADY_R, 409);
    yield apply_models_1.default.update({
        where: {
            id: rId,
            type: "group_chat",
        },
        data: { status: "REJECTED" },
    });
    const notUserRoleParticipants = yield (0, participants_utils_1.findNotUserRoleParticipant)(gId, uId);
    notUserRoleParticipants.forEach((p) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(p.userId, "USER"), event_1.Socket_Event.REJECT_GAR, {
            requestId: rId,
            roomId: gId,
        });
    });
    yield (0, notification_utils_1.notify)(req, {
        groupId: gId,
        type: "rejected_group_application",
        receiverId: apRq.userId,
        userId: uId,
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Successfully rejected application request."));
});
exports.rejectGroupChatApplicationRequest = rejectGroupChatApplicationRequest;
const getMembershipRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.query;
    const status = type === "all" ? undefined : type === null || type === void 0 ? void 0 : type.toString().toUpperCase();
    const { limit, offset } = (0, paging_1.parsePaging)(req);
    const { userId } = req;
    const uId = Number(userId);
    const appRequests = yield apply_models_1.default.findMany({
        where: {
            userId: uId,
            type: "group_chat",
            status: status,
        },
        orderBy: [
            {
                status: "asc",
            },
            { createdAt: "desc" },
        ],
        select: Object.assign({}, app_request_1.selectGroupMembershipRequest),
        take: limit,
        skip: offset,
    });
    const total = yield apply_models_1.default.count({
        where: {
            userId: uId,
            type: "group_chat",
            status: status,
        },
    });
    const normalizedAprq = yield Promise.all(appRequests.map((ap) => Promise.resolve((0, app_request_normalize_1.normalizeMembershipRequest)(ap))));
    return res
        .status(200)
        .json(yield (0, paging_1.getPagingObject)({ req, data: normalizedAprq, total_records: total }));
});
exports.getMembershipRequests = getMembershipRequests;
const deleteMembershipRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const { userId } = req;
    const uId = Number(userId);
    const rId = Number(requestId);
    const apRq = yield apply_models_1.default.findUnique({
        where: { id: rId, AND: [{ user: { id: uId } }] },
        select: { groupId: true },
    });
    if (!apRq)
        throw new error_1.RequestError("Group membership request not found.", 404);
    yield apply_models_1.default.delete({
        where: { id: rId, AND: [{ user: { id: uId } }] },
    });
    const notUserRoleParticipants = yield (0, participants_utils_1.findNotUserRoleParticipant)(apRq.groupId, uId);
    notUserRoleParticipants.forEach((p) => {
        (0, socket_utils_1.emitSocketEvent)(req, (0, consts_1.Socket_Id)(p.userId, "USER"), event_1.Socket_Event.DELETE_GAR, {
            roomId: apRq.groupId,
            requestId: rId,
        });
    });
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.deleteMembershipRequest = deleteMembershipRequest;
const getGroupMembershipRequestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const { userId } = req;
    const rId = Number(requestId);
    const uId = Number(userId);
    const membershipRequest = yield apply_models_1.default.findUnique({
        where: {
            id: rId,
            userId: uId,
        },
        select: app_request_1.selectGroupMembershipRequest,
    });
    if (!membershipRequest)
        throw new error_1.RequestError(messages_1.NotFound.MR, 404);
    if (membershipRequest.user.id !== uId)
        throw new error_1.ForbiddenError();
    const normalizedRequest = yield (0, app_request_normalize_1.normalizeMembershipRequest)(membershipRequest);
    return res.status(200).json(new response_1.ApiResponse(normalizedRequest, 200));
});
exports.getGroupMembershipRequestById = getGroupMembershipRequestById;

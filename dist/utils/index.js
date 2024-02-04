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
exports.getNotificationCount = exports.getMessageCount = exports.checkParticipants = exports.isNullOrUndefined = exports.getRandomToken = exports.generateAccessToken = exports.getFullName = exports.generateRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const consts_1 = require("../lib/consts");
const chat_models_1 = __importStar(require("../models/chat.models"));
const user_models_1 = __importDefault(require("../models/user.models"));
const code_1 = require("../lib/code");
const error_1 = require("../lib/error");
const messages_1 = require("../lib/messages");
const user_1 = require("../lib/query/user");
const notification_models_1 = __importDefault(require("../models/notification.models"));
const notification_controllers_1 = require("../controllers/notification.controllers");
const generateRefreshToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield jsonwebtoken_1.default.sign(payload, consts_1.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
});
exports.generateRefreshToken = generateRefreshToken;
const getFullName = (firstName, lastName, newFirstName, newLastName) => {
    return `${newFirstName !== null && newFirstName !== void 0 ? newFirstName : firstName} ${newLastName !== null && newLastName !== void 0 ? newLastName : lastName}`;
};
exports.getFullName = getFullName;
const generateAccessToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield jsonwebtoken_1.default.sign(payload, consts_1.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600,
        // expiresIn: 1,
    });
});
exports.generateAccessToken = generateAccessToken;
const getRandomToken = () => {
    return new Promise((resolve) => resolve(crypto_1.default.randomBytes(32).toString("hex")));
};
exports.getRandomToken = getRandomToken;
const isNullOrUndefined = (data) => {
    return data === null || data === undefined;
};
exports.isNullOrUndefined = isNullOrUndefined;
const checkParticipants = (participants, groupId, currentUserRole, isDeleting = false) => __awaiter(void 0, void 0, void 0, function* () {
    const chatRoom = chat_models_1.ChatRoom.findUnique({
        where: {
            id: groupId,
        },
    });
    if (!chatRoom)
        throw new error_1.RequestError(messages_1.NotFound.GROUP_CHAT, 404);
    const errors = [];
    yield Promise.all(participants.map((item, i) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = isDeleting ? item : item.id;
        const participantRole = (_a = item === null || item === void 0 ? void 0 : item.role) !== null && _a !== void 0 ? _a : null;
        const user = yield user_models_1.default.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            const participant = yield chat_models_1.ChatRoomParticipant.findUnique({
                where: {
                    chatRoomId_userId: {
                        chatRoomId: groupId,
                        userId: id,
                    },
                },
            });
            // Check if user is participated in the group before removing them
            if (isDeleting && !participant && user) {
                errors.push({
                    message: `Can't found participant with ID ${id} in the group.`,
                    groupId,
                    code: code_1.Code.NOT_FOUND,
                    id,
                });
                return;
            }
            const IS_ADMIN_PROMOTE_USER = (participant === null || participant === void 0 ? void 0 : participant.role) === "user" &&
                participantRole === "admin" &&
                currentUserRole === "admin";
            const IS_ADMIN_DEMOTING_ADMIN = (participant === null || participant === void 0 ? void 0 : participant.role) === "admin" &&
                participantRole === "user" &&
                currentUserRole === "admin";
            const IS_ADMIN_UPDATE_CREATOR = (participant === null || participant === void 0 ? void 0 : participant.role) === "creator" && currentUserRole === "admin";
            const IS_UPDATING_USER_WITH_ROLE_ADMIN = (participant === null || participant === void 0 ? void 0 : participant.role) === "admin" && currentUserRole === "admin";
            const IS_USER_ALREADY_EXIST = participant && (participant === null || participant === void 0 ? void 0 : participant.role) === participantRole;
            // Check if user already exist in the group before add them
            // if user is already exist with role user and the item.role is "admin" that user will be promoted as admin in the group
            if (participant && IS_ADMIN_UPDATE_CREATOR) {
                errors.push({
                    message: `Admin cannot ${isDeleting ? "delete" : "demote"} group creator`,
                    code: code_1.Code.FORBIDDEN,
                    groupId,
                    id,
                });
                return;
            }
            if (IS_USER_ALREADY_EXIST && !isDeleting) {
                errors.push({
                    message: `Participant with ID ${id} already exists in the group.`,
                    groupId,
                    code: code_1.Code.DUPLICATE,
                    id,
                });
                return;
            }
            // Check if current user "admin" role is deleting or demoting another "admin"
            // if yes it will add error because admin can't demote or delete another admin
            if (participant && IS_UPDATING_USER_WITH_ROLE_ADMIN && isDeleting
                ? true
                : IS_ADMIN_DEMOTING_ADMIN && !IS_ADMIN_PROMOTE_USER) {
                errors.push({
                    message: isDeleting
                        ? "Can't delete user with role admin with current role (admin)"
                        : "Can't demote admin to user with current role (admin)",
                    code: code_1.Code.FORBIDDEN,
                    id,
                    groupId,
                });
                return;
            }
        }
        else {
            errors.push({
                message: messages_1.NotFound.USER,
                code: code_1.Code.NOT_FOUND,
                id,
            });
        }
    })));
    // Should we edit the code to make an admin can demote another admin? for now, nahh
    if (errors.length > 0)
        throw new error_1.RequestError(isDeleting
            ? "Failed to remove participants."
            : "Failed add participants into the group.", 400, errors);
});
exports.checkParticipants = checkParticipants;
const getMessageCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const c = yield chat_models_1.default.count({
        where: {
            chatRoom: {
                participants: {
                    some: {
                        userId: userId,
                    },
                    every: {
                        user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(userId)), (0, user_1.excludeBlockingUser)(userId)),
                    },
                },
            },
            AND: [
                {
                    authorId: {
                        not: userId,
                    },
                },
                {
                    readedBy: {
                        every: {
                            userId: { not: userId },
                        },
                    },
                },
            ],
        },
    });
    return c;
});
exports.getMessageCount = getMessageCount;
const getNotificationCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const c = yield notification_models_1.default.count({
        where: {
            isRead: false,
            receiverId: userId,
            AND: (0, notification_controllers_1.notificationWhereAndInput)(userId),
        },
    });
    return c;
});
exports.getNotificationCount = getNotificationCount;

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
exports.checkMessageAccess = exports.checkIsParticipatedInChatRoom = void 0;
const response_1 = require("../utils/response");
const messages_1 = require("../lib/messages");
const chat_models_1 = __importStar(require("../models/chat.models"));
const error_1 = require("../lib/error");
const handler_middlewares_1 = require("./handler.middlewares");
const chatRoom_utils_1 = require("../utils/chat/chatRoom.utils");
function notFound(req, res) {
    return res.status(404).json(new response_1.ApiError(404, messages_1.NotFound.ROUTE));
}
exports.default = notFound;
const checkIsParticipatedInChatRoom = ({ body = "", params = "", shouldAlsoBlockSendingMessageToGroupChat = false, shouldAlsoBlockUserRole = false, }) => (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { userId } = req;
    const chatRoomId = (_b = (_a = req.params) === null || _a === void 0 ? void 0 : _a[params]) !== null && _b !== void 0 ? _b : (_c = req.body) === null || _c === void 0 ? void 0 : _c[body];
    const UID = Number(userId);
    const CRID = Number(chatRoomId);
    const chatRoom = yield chat_models_1.ChatRoom.findUnique({
        where: {
            id: CRID,
            OR: (0, chatRoom_utils_1.chatRoomWhereOrInput)(UID),
        },
        select: {
            groupVisibility: true,
            isGroupChat: true,
            participants: {
                select: {
                    userId: true,
                    role: true,
                },
                where: {
                    userId: UID,
                },
            },
        },
    });
    if (!chatRoom)
        throw new error_1.RequestError(messages_1.NotFound.CHAT_ROOM, 404);
    const isPrivateVisibility = chatRoom.groupVisibility === "private";
    const isParticipated = ((_e = (_d = chatRoom === null || chatRoom === void 0 ? void 0 : chatRoom.participants) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.userId) ? true : false;
    const isGroupChat = (chatRoom === null || chatRoom === void 0 ? void 0 : chatRoom.isGroupChat) ? true : false;
    const isNotParticipatedInGroupChatAndVisibilityIsPrivate = !isParticipated && isPrivateVisibility && isGroupChat;
    const isNotParticipatedInPersonalChat = !isParticipated && !isGroupChat;
    const isForbiddenForUser = isParticipated
        ? ((_g = (_f = chatRoom.participants) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.role) === "user" && shouldAlsoBlockUserRole
        : shouldAlsoBlockUserRole;
    console.log(shouldAlsoBlockUserRole, "ShouldAlsoBlockUserRole");
    console.log(chatRoom, "Chat ROOOOMSSS");
    console.log(isForbiddenForUser, "isForbiddenForUser");
    const isForbidden = isNotParticipatedInGroupChatAndVisibilityIsPrivate ||
        isNotParticipatedInPersonalChat ||
        isForbiddenForUser;
    if (isGroupChat &&
        !shouldAlsoBlockSendingMessageToGroupChat &&
        !isForbidden)
        return next();
    if (isForbidden)
        throw new error_1.ForbiddenError();
    return next();
}));
exports.checkIsParticipatedInChatRoom = checkIsParticipatedInChatRoom;
exports.checkMessageAccess = (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h, _j, _k, _l;
    const { messageId } = req.params;
    const { userId } = req;
    const UID = Number(userId);
    const mId = Number(messageId);
    const message = yield chat_models_1.default.findUnique({
        where: { id: mId },
        select: {
            chatRoom: {
                select: {
                    isGroupChat: true,
                    groupVisibility: true,
                    participants: {
                        where: {
                            userId: UID,
                        },
                        select: {
                            userId: true,
                        },
                    },
                },
            },
        },
    });
    const isParticipated = ((_j = (_h = message === null || message === void 0 ? void 0 : message.chatRoom.participants) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.userId)
        ? true
        : false;
    const isGroupChat = ((_k = message === null || message === void 0 ? void 0 : message.chatRoom) === null || _k === void 0 ? void 0 : _k.isGroupChat) ? true : false;
    const isPrivateVisibility = ((_l = message === null || message === void 0 ? void 0 : message.chatRoom) === null || _l === void 0 ? void 0 : _l.groupVisibility) === "private";
    const isNotParticipatedInGroupChatAndVisibilityIsPrivate = !isParticipated && isPrivateVisibility && isGroupChat;
    const isNotParticipatedInPersonalChat = !isParticipated && !isGroupChat;
    const isForbidden = isNotParticipatedInGroupChatAndVisibilityIsPrivate ||
        isNotParticipatedInPersonalChat;
    if (isForbidden) {
        throw new error_1.ForbiddenError();
    }
    next();
}));

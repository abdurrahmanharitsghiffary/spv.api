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
exports.getCounts = exports.defaultTypes = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const chat_models_1 = __importStar(require("../models/chat.models"));
const user_1 = require("../lib/query/user");
const comment_models_1 = __importStar(require("../models/comment.models"));
const post_models_1 = __importStar(require("../models/post.models"));
const utils_1 = require("../utils");
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const response_1 = require("../utils/response");
exports.defaultTypes = [
    "readed_messages",
    "readed_notifications",
    "liked_posts",
    "liked_comments",
    "unread_messages",
    "unread_notifications",
    "notifications",
    "messages",
    "posts",
    "saved_posts",
    "followers",
    "followed_users",
    "blocked_users",
    "chat_rooms",
    "participated_groups",
    "comments",
];
const convertType = (type) => {
    var _a, _b;
    const t = type.split("_");
    const t2 = (_a = t === null || t === void 0 ? void 0 : t[1]) !== null && _a !== void 0 ? _a : "";
    const uT2 = ((_b = t2 === null || t2 === void 0 ? void 0 : t2[0]) !== null && _b !== void 0 ? _b : "").toUpperCase() + (t2 !== null && t2 !== void 0 ? t2 : "").slice(1);
    return `${t[0]}${uT2}`;
};
const filterGroupChatCount = (userId) => [
    {
        isGroupChat: false,
        participants: {
            every: {
                user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(userId)), (0, user_1.excludeBlockingUser)(userId)),
            },
            some: {
                userId,
            },
        },
    },
    { isGroupChat: true, participants: { some: { userId } } },
];
const getCounts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type = "" } = req.query;
    const { userId } = req;
    const uId = Number(userId);
    let countTypes = type.toString().split(",");
    if ((countTypes === null || countTypes === void 0 ? void 0 : countTypes.includes("")) ||
        (countTypes !== null && countTypes !== void 0 ? countTypes : []).length <= 0 ||
        countTypes === undefined) {
        countTypes = exports.defaultTypes;
    }
    const counts = {};
    yield Promise.all(countTypes.map((type) => __awaiter(void 0, void 0, void 0, function* () {
        counts[convertType(type)] = yield getCountByType(type, uId);
    })));
    res.status(200).json(new response_1.ApiResponse(counts, 200));
});
exports.getCounts = getCounts;
const getCountByType = (type, userId) => __awaiter(void 0, void 0, void 0, function* () {
    switch (type) {
        case "blocked_users": {
            const c = yield user_models_1.default.count({
                where: {
                    id: { not: userId },
                    blocking: { some: { id: userId } },
                },
            });
            return c;
        }
        case "chat_rooms": {
            const c = yield chat_models_1.ChatRoom.count({
                where: {
                    OR: filterGroupChatCount(userId),
                },
            });
            return c;
        }
        case "comments": {
            const c = yield comment_models_1.default.count({ where: { userId } });
            return c;
        }
        case "followed_users": {
            const c = yield user_models_1.default.count({
                where: Object.assign(Object.assign(Object.assign({ id: { not: userId } }, (0, user_1.excludeBlockedUser)(userId)), (0, user_1.excludeBlockingUser)(userId)), { followedBy: { some: { id: userId } } }),
            });
            return c;
        }
        case "followers": {
            const c = yield user_models_1.default.count({
                where: Object.assign(Object.assign(Object.assign({ id: { not: userId } }, (0, user_1.excludeBlockedUser)(userId)), (0, user_1.excludeBlockingUser)(userId)), { following: { some: { id: userId } } }),
            });
            return c;
        }
        case "liked_comments": {
            const c = yield comment_models_1.CommentLike.count({ where: { userId } });
            return c;
        }
        case "liked_posts": {
            const c = yield post_models_1.PostLike.count({ where: { userId } });
            return c;
        }
        case "messages": {
            const c = yield chat_models_1.default.count({
                where: {
                    authorId: userId,
                    chatRoom: { OR: filterGroupChatCount(userId) },
                },
            });
            return c;
        }
        case "notifications": {
            const c = yield (0, utils_1.getNotificationCount)(userId, undefined);
            return c;
        }
        case "participated_groups": {
            const c = yield chat_models_1.ChatRoom.count({
                where: { isGroupChat: true, participants: { some: { userId } } },
            });
            return c;
        }
        case "posts": {
            const c = yield post_models_1.default.count({ where: { authorId: userId } });
            return c;
        }
        case "readed_messages": {
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
                    AND: [{ authorId: { not: userId }, readedBy: { some: { userId } } }],
                },
            });
            return c;
        }
        case "unread_messages": {
            const c = yield (0, utils_1.getMessageCount)(userId);
            return c;
        }
        case "readed_notifications": {
            const c = yield (0, utils_1.getNotificationCount)(userId, true);
            return c;
        }
        case "unread_notifications": {
            const c = yield (0, utils_1.getNotificationCount)(userId, false);
            return c;
        }
        case "saved_posts": {
            const c = yield prismaClient_1.default.savedPost.count({ where: { userId } });
            return c;
        }
    }
});

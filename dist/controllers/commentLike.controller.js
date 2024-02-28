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
exports.getCommentIsLiked = exports.deleteLike = exports.createLike = exports.getCommentLikesByCommentId = void 0;
const comment_models_1 = __importStar(require("../models/comment.models"));
const error_1 = require("../lib/error");
const response_1 = require("../utils/response");
const user_1 = require("../lib/query/user");
const comment_utils_1 = require("../utils/comment/comment.utils");
const messages_1 = require("../lib/messages");
const paging_1 = require("../utils/paging");
const notification_utils_1 = require("../utils/notification/notification.utils");
// /continue
const getCommentLikesByCommentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { commentId } = req.params;
    const { limit, offset } = (0, paging_1.parsePaging)(req);
    const uId = Number(userId);
    const cId = Number(commentId);
    yield (0, comment_utils_1.checkCommentIsFound)({ commentId: cId, currentUserId: uId });
    const likes = yield comment_models_1.CommentLike.findMany({
        where: {
            AND: [
                {
                    user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(uId)), (0, user_1.excludeBlockingUser)(uId)),
                },
            ],
            commentId: cId,
        },
        select: {
            userId: true,
            user: {
                select: user_1.selectUserSimplified,
            },
        },
        take: limit,
        skip: offset,
    });
    const count = yield comment_models_1.CommentLike.count({
        where: {
            commentId: cId,
        },
    });
    const normalizedLikes = yield Promise.all(likes.map((like) => {
        var _a;
        return Promise.resolve({
            avatarImage: (_a = like.user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage,
            firstName: like.user.firstName,
            fullName: like.user.fullName,
            id: like.userId,
            isOnline: like.user.isOnline,
            lastName: like.user.lastName,
            username: like.user.username,
        });
    }));
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        total_records: count,
        data: normalizedLikes,
    }));
});
exports.getCommentLikesByCommentId = getCommentLikesByCommentId;
const createLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { commentId } = req.params;
    const uId = Number(userId);
    const cId = Number(commentId);
    const comment = yield (0, comment_utils_1.checkCommentIsFound)({
        commentId: cId,
        currentUserId: uId,
    });
    const commentAlreadyExist = yield comment_models_1.CommentLike.findUnique({
        where: {
            userId_commentId: {
                userId: uId,
                commentId: cId,
            },
        },
    });
    if (commentAlreadyExist)
        throw new error_1.RequestError("You already liked this comment", 409);
    const createdLike = yield comment_models_1.CommentLike.create({
        data: {
            userId: uId,
            commentId: cId,
        },
    });
    yield (0, notification_utils_1.notify)(req, {
        type: "liking_comment",
        commentId: comment.id,
        postId: comment.postId,
        receiverId: comment.userId,
        userId: uId,
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(createdLike, 201, "Comment successfully liked."));
});
exports.createLike = createLike;
const deleteLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req;
    const { commentId } = req.params;
    const uId = Number(userId);
    const cId = Number(commentId);
    const comment = yield comment_models_1.default.findUnique({
        where: {
            id: cId,
        },
        select: {
            likes: {
                select: {
                    userId: true,
                },
                where: {
                    userId: uId,
                },
            },
        },
    });
    if (!comment)
        throw new error_1.RequestError(messages_1.NotFound.COMMENT, 404);
    if (!((_b = (_a = comment.likes) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.userId)) {
        throw new error_1.RequestError("Failed to unlike comment, because you are not liking the comment", 
        // NEED FIX CODE:STATUS_CODE
        400);
    }
    yield comment_models_1.CommentLike.delete({
        where: {
            userId_commentId: {
                userId: uId,
                commentId: cId,
            },
        },
    });
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.deleteLike = deleteLike;
const getCommentIsLiked = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { commentId } = req.params;
    const isLiked = yield comment_models_1.CommentLike.findUnique({
        where: {
            userId_commentId: {
                userId: Number(userId),
                commentId: Number(commentId),
            },
        },
    });
    const totalLikes = yield comment_models_1.CommentLike.count({
        where: {
            commentId: Number(commentId),
        },
    });
    return res
        .status(200)
        .json(new response_1.ApiResponse({ isLiked: isLiked ? true : false, totalLikes }, 200));
});
exports.getCommentIsLiked = getCommentIsLiked;

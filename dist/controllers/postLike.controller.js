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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostIsLiked = exports.deleteLike = exports.createLike = exports.getPostLikesByPostId = void 0;
const post_models_1 = require("../models/post.models");
const error_1 = require("../lib/error");
const response_1 = require("../utils/response");
const user_1 = require("../lib/query/user");
const post_utils_1 = require("../utils/post/post.utils");
const postLike_utils_1 = require("../utils/post/postLike.utils");
const paging_1 = require("../utils/paging");
const notification_utils_1 = require("../utils/notification/notification.utils");
// CONTINUe
const getPostLikesByPostId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { postId } = req.params;
    const { limit, offset } = (0, paging_1.parsePaging)(req);
    yield (0, post_utils_1.checkPostIsFound)({
        postId: Number(postId),
        currentUserId: Number(userId),
    });
    const likes = yield post_models_1.PostLike.findMany({
        where: {
            postId: Number(postId),
            user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(Number(userId))), (0, user_1.excludeBlockingUser)(Number(userId))),
        },
        select: {
            userId: true,
            postId: true,
            user: {
                select: Object.assign({}, user_1.selectUserSimplified),
            },
        },
        take: limit,
        skip: offset,
    });
    const count = yield post_models_1.PostLike.count({
        where: {
            postId: Number(postId),
        },
    });
    const normalizedLikes = yield Promise.all(likes.map((like) => {
        var _a;
        return Promise.resolve({
            id: like.userId,
            firstName: like.user.firstName,
            lastName: like.user.lastName,
            username: like.user.username,
            avatarImage: (_a = like.user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage,
            fullName: like.user.fullName,
            isOnline: like.user.isOnline,
        });
    }));
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        total_records: count,
        data: normalizedLikes,
    }));
});
exports.getPostLikesByPostId = getPostLikesByPostId;
const createLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req;
    const { postId } = req.params;
    const pId = Number(postId);
    const uId = Number(userId);
    const post = yield (0, postLike_utils_1.findPostIsLiked)(pId, uId);
    if ((_b = (_a = post.likes) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.userId)
        throw new error_1.RequestError("Post already liked", 409);
    const createdLike = yield post_models_1.PostLike.create({
        data: {
            userId: uId,
            postId: pId,
        },
        select: {
            post: {
                select: {
                    authorId: true,
                },
            },
        },
    });
    yield (0, notification_utils_1.notify)(req, {
        type: "liking_post",
        postId: pId,
        receiverId: createdLike.post.authorId,
        userId: uId,
    });
    return res.status(201).json(new response_1.ApiResponse(createdLike, 201));
});
exports.createLike = createLike;
const deleteLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { userId } = req;
    const { postId } = req.params;
    const pId = Number(postId);
    const uId = Number(userId);
    const post = yield (0, postLike_utils_1.findPostIsLiked)(pId, uId);
    if (!((_d = (_c = post.likes) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.userId))
        throw new error_1.RequestError("Post is not liked.", 400);
    yield post_models_1.PostLike.delete({
        where: {
            userId_postId: { userId: uId, postId: pId },
        },
    });
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.deleteLike = deleteLike;
const getPostIsLiked = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { postId } = req.params;
    const uId = Number(userId);
    const pId = Number(postId);
    const isLiked = yield post_models_1.PostLike.findFirst({
        where: {
            postId: pId,
            userId: uId,
        },
    });
    const total_likes = yield post_models_1.PostLike.count({
        where: {
            postId: pId,
        },
    });
    return res
        .status(200)
        .json(new response_1.ApiResponse({ isLiked: isLiked ? true : false, total_likes }, 200));
});
exports.getPostIsLiked = getPostIsLiked;

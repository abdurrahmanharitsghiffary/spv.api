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
exports.checkPostIsFound = exports.searchPosts = exports.findSavedPost = exports.findFollowedUserPosts = exports.findAllPosts = exports.findPostsByAuthorId = exports.findPostById = void 0;
const error_1 = require("../../lib/error");
const post_models_1 = __importDefault(require("../../models/post.models"));
const post_1 = require("../../lib/query/post");
const post_normalize_1 = require("./post.normalize");
const prismaClient_1 = __importDefault(require("../../config/prismaClient"));
const user_1 = require("../../lib/query/user");
const messages_1 = require("../../lib/messages");
const postSelectExtended = (currentUserId) => (Object.assign(Object.assign({}, post_1.selectPost), { comments: Object.assign(Object.assign({}, post_1.selectPost.comments), { where: {
            parentId: null,
            user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
        }, orderBy: {
            createdAt: "desc",
        } }), likes: {
        select: {
            userId: true,
        },
        where: {
            userId: currentUserId,
        },
        take: 1,
    }, follower: {
        select: {
            userId: true,
        },
        take: 1,
        where: {
            userId: currentUserId,
        },
    }, author: {
        select: Object.assign(Object.assign({}, post_1.selectPost.author.select), { followedBy: {
                select: {
                    id: true,
                },
                where: {
                    id: currentUserId,
                },
                take: 1,
            } }),
    } }));
const postWhereInput = {
    type: {
        in: ["public", "friends"],
    },
};
const postFindUniqueWhereInput = (postId, currentUserId) => ({
    id: Number(postId),
    AND: postWhereAndInput(currentUserId),
    OR: [
        {
            authorId: currentUserId,
            type: { in: ["friends", "private", "public"] },
        },
        Object.assign({}, postWhereInput),
    ],
});
const postWhereAndInput = (currentUserId) => [
    {
        author: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
    },
];
const findPostById = (postId, currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield post_models_1.default.findUnique({
        where: postFindUniqueWhereInput(postId, Number(currentUserId)),
        select: postSelectExtended(currentUserId),
    });
    if (!post)
        throw new error_1.RequestError(messages_1.NotFound.POST, 404);
    const normalizedPost = yield (0, post_normalize_1.normalizePost)(post);
    return normalizedPost;
});
exports.findPostById = findPostById;
const findPostsByAuthorId = ({ authorId, offset, limit, currentUserId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield post_models_1.default.findMany({
        where: {
            authorId,
            AND: postWhereAndInput(currentUserId),
            OR: [
                {
                    authorId: currentUserId,
                    type: { in: ["friends", "private", "public"] },
                },
                Object.assign({ authorId }, postWhereInput),
            ],
        },
        select: postSelectExtended(currentUserId),
        orderBy: {
            createdAt: "desc",
        },
        take: limit !== null && limit !== void 0 ? limit : 20,
        skip: offset !== null && offset !== void 0 ? offset : 0,
    });
    const totalPosts = yield post_models_1.default.count({
        where: {
            authorId,
            AND: postWhereAndInput(currentUserId),
            OR: [
                {
                    authorId: currentUserId,
                    type: { in: ["friends", "private", "public"] },
                },
                Object.assign({ authorId }, postWhereInput),
            ],
        },
    });
    return {
        data: yield Promise.all(posts.map((post) => Promise.resolve((0, post_normalize_1.normalizePost)(post)))),
        total: totalPosts,
    };
});
exports.findPostsByAuthorId = findPostsByAuthorId;
const findAllPosts = ({ limit, offset, currentUserId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield post_models_1.default.findMany({
        where: {
            AND: postWhereAndInput(currentUserId),
        },
        orderBy: { createdAt: "desc" },
        select: postSelectExtended(currentUserId),
        skip: offset !== null && offset !== void 0 ? offset : 0,
        take: limit !== null && limit !== void 0 ? limit : 20,
    });
    const totalPosts = yield post_models_1.default.count({
        where: {
            AND: postWhereAndInput(currentUserId),
        },
    });
    return {
        data: yield Promise.all(posts.map((post) => Promise.resolve((0, post_normalize_1.normalizePost)(post)))),
        total: totalPosts,
    };
});
exports.findAllPosts = findAllPosts;
const findFollowedUserPosts = ({ limit = 20, offset = 0, currentUserId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield post_models_1.default.findMany({
        where: Object.assign(Object.assign({ AND: postWhereAndInput(currentUserId) }, postWhereInput), { author: {
                followedBy: {
                    some: {
                        id: currentUserId,
                    },
                },
            } }),
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        distinct: "authorId",
        select: postSelectExtended(currentUserId),
    });
    const postsTotal = yield post_models_1.default.count({
        where: Object.assign(Object.assign({ AND: postWhereAndInput(currentUserId) }, postWhereInput), { author: {
                followedBy: {
                    some: {
                        id: currentUserId,
                    },
                },
            } }),
    });
    return {
        data: yield Promise.all(posts.map((post) => Promise.resolve((0, post_normalize_1.normalizePost)(post)))),
        total: postsTotal,
    };
});
exports.findFollowedUserPosts = findFollowedUserPosts;
const findSavedPost = ({ userId, limit = 20, offset = 0, currentUserId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const savedPosts = yield prismaClient_1.default.savedPost.findMany({
        where: {
            post: {
                OR: [
                    {
                        author: {
                            id: currentUserId,
                        },
                        type: { in: ["friends", "private", "public"] },
                    },
                    Object.assign({}, postWhereInput),
                ],
                AND: postWhereAndInput(currentUserId),
            },
            userId: Number(userId),
        },
        skip: offset,
        take: limit,
        orderBy: {
            assignedAt: "desc",
        },
        select: {
            post: {
                select: postSelectExtended(currentUserId),
            },
            assignedAt: true,
        },
    });
    const total = yield prismaClient_1.default.savedPost.count({
        where: {
            post: {
                OR: [
                    {
                        author: {
                            id: currentUserId,
                        },
                        type: { in: ["friends", "private", "public"] },
                    },
                    Object.assign({}, postWhereInput),
                ],
                AND: postWhereAndInput(currentUserId),
            },
            userId: Number(userId),
        },
    });
    return {
        data: yield Promise.all(savedPosts.map((post) => Promise.resolve((0, post_normalize_1.normalizePost)(Object.assign(Object.assign({}, post.post), { assignedAt: post.assignedAt }))))),
        total,
    };
});
exports.findSavedPost = findSavedPost;
const searchPosts = ({ query, limit = 20, offset = 0, currentUserId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield post_models_1.default.findMany({
        where: Object.assign(Object.assign({ AND: postWhereAndInput(currentUserId) }, postWhereInput), { OR: [
                {
                    title: {
                        contains: query,
                    },
                },
                {
                    content: {
                        contains: query,
                    },
                },
            ] }),
        orderBy: {
            createdAt: "desc",
        },
        select: postSelectExtended(currentUserId),
        take: limit,
        skip: offset,
    });
    const resultsTotal = yield post_models_1.default.count({
        where: Object.assign(Object.assign({ AND: postWhereAndInput(currentUserId) }, postWhereInput), { OR: [
                {
                    title: {
                        contains: query,
                    },
                },
                {
                    content: {
                        contains: query,
                    },
                },
            ] }),
    });
    return {
        data: yield Promise.all(posts.map((post) => Promise.resolve((0, post_normalize_1.normalizePost)(post)))),
        total: resultsTotal,
    };
});
exports.searchPosts = searchPosts;
const checkPostIsFound = ({ postId, currentUserId, customMessage, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const andInput = currentUserId ? postWhereAndInput(currentUserId) : undefined;
    const post = yield post_models_1.default.findUnique({
        where: {
            id: postId,
            AND: andInput,
        },
        select: { id: true },
    });
    if (!post)
        throw new error_1.RequestError((_a = customMessage === null || customMessage === void 0 ? void 0 : customMessage.message) !== null && _a !== void 0 ? _a : messages_1.NotFound.POST, (_b = customMessage === null || customMessage === void 0 ? void 0 : customMessage.statusCode) !== null && _b !== void 0 ? _b : 404);
    return post ? true : false;
});
exports.checkPostIsFound = checkPostIsFound;

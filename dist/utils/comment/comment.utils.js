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
exports.checkCommentIsFound = exports.findCommentsByPostId = exports.findCommentById = void 0;
const error_1 = require("../../lib/error");
const comment_1 = require("../../lib/query/comment");
const comment_models_1 = __importDefault(require("../../models/comment.models"));
const comment_normalize_1 = require("./comment.normalize");
const user_1 = require("../../lib/query/user");
const messages_1 = require("../../lib/messages");
const commentWhereAndInput = (currentUserId) => [
    {
        post: {
            author: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
        },
    },
    {
        OR: [
            { parentId: null },
            {
                parentComment: {
                    user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
                },
            },
        ],
    },
    {
        user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
    },
];
const commentSelectChildrenCommentInput = (currentUserId) => (Object.assign(Object.assign({}, comment_1.selectComment.childrenComment), { where: {
        AND: [
            {
                user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
            },
        ],
    } }));
const selectCommentExtended = (currentUserId) => (Object.assign(Object.assign({}, comment_1.selectComment), { childrenComment: commentSelectChildrenCommentInput(currentUserId), user: {
        select: Object.assign(Object.assign({}, comment_1.selectComment.user.select), { followedBy: {
                take: 1,
                select: {
                    id: true,
                },
                where: {
                    id: currentUserId,
                },
            } }),
    }, likes: {
        select: {
            userId: true,
        },
        take: 1,
        where: {
            userId: currentUserId,
        },
    } }));
const findCommentById = (commentId, currentUserId, shouldNormalize = true) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield comment_models_1.default.findUnique({
        where: {
            id: commentId || commentId === 0 ? commentId : undefined,
            AND: commentWhereAndInput(currentUserId),
        },
        select: selectCommentExtended(currentUserId),
    });
    console.log(comment);
    if (!comment)
        throw new error_1.RequestError(messages_1.NotFound.COMMENT, 404);
    if (!shouldNormalize)
        return comment;
    const normalizedComment = yield (0, comment_normalize_1.normalizeComment)(comment);
    return normalizedComment;
});
exports.findCommentById = findCommentById;
const findCommentsByPostId = (postId, offset, limit, sortBy = ["latest"], currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const sortOptions = [];
    sortBy === null || sortBy === void 0 ? void 0 : sortBy.forEach((sort) => {
        if (["highest", "lowest"].includes(sort)) {
            const likeSort = {
                likes: {
                    _count: undefined,
                },
            };
            if (likeSort.likes) {
                if (sort === "highest") {
                    likeSort.likes._count = "desc";
                }
                else {
                    likeSort.likes._count = "asc";
                }
            }
            sortOptions.unshift(likeSort);
        }
        else if (["latest", "oldest"].includes(sort)) {
            const timeSort = {
                createdAt: undefined,
            };
            if (sort === "latest") {
                timeSort.createdAt = "desc";
            }
            else {
                timeSort.createdAt = "asc";
            }
            sortOptions.push(timeSort);
        }
    });
    const comments = yield comment_models_1.default.findMany({
        where: {
            postId,
            AND: [
                { parentId: null },
                {
                    user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
                },
                {
                    post: {
                        author: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
                    },
                },
            ],
        },
        take: limit,
        skip: offset,
        orderBy: sortOptions,
        select: selectCommentExtended(currentUserId),
    });
    // TODO
    // Should filter by their parentId? or just return the exact record by blocking the usersr?
    const totalComments = yield comment_models_1.default.count({
        where: {
            postId,
            AND: [
                { parentId: null },
                {
                    user: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
                },
                {
                    post: {
                        author: Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
                    },
                },
            ],
        },
    });
    const normalizedComments = yield (0, comment_normalize_1.normalizeComments)(comments);
    return { data: normalizedComments, total: totalComments };
});
exports.findCommentsByPostId = findCommentsByPostId;
const checkCommentIsFound = ({ commentId, currentUserId, customMessage, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const andInput = currentUserId
        ? commentWhereAndInput(currentUserId)
        : undefined;
    const comment = yield comment_models_1.default.findUnique({
        where: {
            id: commentId,
            AND: andInput,
        },
        select: {
            userId: true,
            id: true,
            postId: true,
        },
    });
    if (!comment)
        throw new error_1.RequestError((_a = customMessage === null || customMessage === void 0 ? void 0 : customMessage.message) !== null && _a !== void 0 ? _a : messages_1.NotFound.COMMENT, (_b = customMessage === null || customMessage === void 0 ? void 0 : customMessage.statusCode) !== null && _b !== void 0 ? _b : 404);
    return comment;
});
exports.checkCommentIsFound = checkCommentIsFound;

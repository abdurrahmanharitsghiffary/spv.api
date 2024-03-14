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
exports.deletePostImagesByPostId = exports.deletePostImageById = exports.createPost = exports.updatePost = exports.deletePost = exports.deleteSavedPost = exports.savePost = exports.getPostIsSaved = exports.getSavedPosts = exports.getPost = exports.getPostCommentsById = exports.getAllPosts = exports.getFollowedUserPost = exports.getAllMyPosts = void 0;
const post_models_1 = __importDefault(require("../models/post.models"));
const post_utils_1 = require("../utils/post/post.utils");
const comment_utils_1 = require("../utils/comment/comment.utils");
const image_models_1 = __importDefault(require("../models/image.models"));
const paging_1 = require("../utils/paging");
const response_1 = require("../utils/response");
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const error_1 = require("../lib/error");
const user_1 = require("../lib/query/user");
const messages_1 = require("../lib/messages");
const cloudinary_1 = __importStar(require("../lib/cloudinary"));
const getAllMyPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { offset = 0, limit = 20 } = req.query;
    const { userId } = req;
    offset = Number(offset);
    limit = Number(limit);
    const posts = yield (0, post_utils_1.findPostsByAuthorId)({
        authorId: Number(userId),
        limit,
        offset,
        currentUserId: Number(userId),
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: posts.data,
        total_records: posts.total,
        req,
    }));
});
exports.getAllMyPosts = getAllMyPosts;
const getFollowedUserPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = 20, offset = 0 } = req.query;
    const { userId } = req;
    const posts = yield (0, post_utils_1.findFollowedUserPosts)({
        limit: Number(limit),
        offset: Number(offset),
        currentUserId: Number(userId),
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: posts.data,
        total_records: posts.total,
        req,
    }));
});
exports.getFollowedUserPost = getFollowedUserPost;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { limit = 20, offset = 0 } = req.query;
    limit = Number(limit);
    offset = Number(offset);
    const posts = yield (0, post_utils_1.findAllPosts)({ limit, offset });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: posts.data,
        total_records: posts.total,
        req,
    }));
});
exports.getAllPosts = getAllPosts;
const getPostCommentsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    let { offset = 0, limit = 20, order_by = "" } = req.query;
    const { postId } = req.params;
    offset = Number(offset);
    limit = Number(limit);
    yield (0, post_utils_1.checkPostIsFound)({
        postId: Number(postId),
        currentUserId: Number(userId),
    });
    const comments = yield (0, comment_utils_1.findCommentsByPostId)(Number(postId), offset, limit, !order_by ? undefined : order_by.split(","), Number(userId));
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: comments.data,
        total_records: comments.total,
        req,
    }));
});
exports.getPostCommentsById = getPostCommentsById;
const getPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { postId } = req.params;
    const post = yield (0, post_utils_1.findPostById)(postId, Number(userId));
    return res.status(200).json(new response_1.ApiResponse(post, 200));
});
exports.getPost = getPost;
const getSavedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: currentUserId } = req;
    let { offset = 0, limit = 20 } = req.query;
    offset = Number(offset);
    limit = Number(limit);
    const { userId } = req;
    const savedPosts = yield (0, post_utils_1.findSavedPost)({
        limit,
        offset,
        userId: Number(userId),
        currentUserId: Number(currentUserId),
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: savedPosts.data,
        total_records: savedPosts.total,
        req,
    }));
});
exports.getSavedPosts = getSavedPosts;
const getPostIsSaved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { postId } = req.params;
    const savedPost = yield prismaClient_1.default.savedPost.findUnique({
        where: {
            postId_userId: {
                postId: Number(postId),
                userId: Number(userId),
            },
        },
    });
    return res.status(200).json(new response_1.ApiResponse(savedPost ? true : false, 200));
});
exports.getPostIsSaved = getPostIsSaved;
const savePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { postId } = req.body;
    const pId = Number(postId);
    const uId = Number(userId);
    yield (0, post_utils_1.checkPostIsFound)({
        postId: Number(postId),
        currentUserId: Number(userId),
    });
    const savedPost = yield prismaClient_1.default.savedPost.findUnique({
        where: {
            postId_userId: {
                postId: pId,
                userId: uId,
            },
        },
    });
    if (savedPost)
        throw new error_1.RequestError("Post already saved", 409);
    const result = yield prismaClient_1.default.savedPost.create({
        data: {
            postId: pId,
            userId: uId,
        },
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(result, 201, "Post successfully saved."));
});
exports.savePost = savePost;
const deleteSavedPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req;
    const { postId } = req.params;
    const pId = Number(postId);
    const uId = Number(userId);
    const post = yield post_models_1.default.findUnique({
        where: {
            id: pId,
            author: {
                AND: [
                    Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(uId)), (0, user_1.excludeBlockingUser)(uId)),
                ],
            },
        },
        select: {
            follower: {
                where: {
                    userId: uId,
                },
                select: {
                    userId: true,
                },
            },
        },
    });
    if (!post)
        throw new error_1.RequestError(messages_1.NotFound.POST, 404);
    if (!((_b = (_a = post.follower) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.userId))
        throw new error_1.RequestError("Post is not saved", 404);
    yield prismaClient_1.default.savedPost.delete({
        where: {
            postId_userId: {
                userId: uId,
                postId: pId,
            },
        },
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Post successfully removed from saved posts."));
});
exports.deleteSavedPost = deleteSavedPost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const deletedPost = yield post_models_1.default.delete({
        where: {
            id: Number(postId),
        },
        include: {
            images: {
                select: { src: true },
            },
        },
    });
    if (deletedPost.images.length > 0) {
        deletedPost.images.forEach((image) => __awaiter(void 0, void 0, void 0, function* () {
            yield cloudinary_1.default.uploader.destroy(image.src);
        }));
    }
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Post successfully deleted."));
});
exports.deletePost = deletePost;
const updatePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content } = req.body;
    const { postId } = req.params;
    const images = (0, cloudinary_1.getCloudinaryImage)(req);
    yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.post.update({
            where: {
                id: Number(postId),
            },
            data: {
                title,
                content,
            },
        });
        if (images && images.length > 0) {
            yield tx.image.createMany({
                data: images.map((src) => ({
                    postId: Number(postId),
                    src,
                })),
            });
        }
        return;
    }));
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Post successfully updated."));
});
exports.updatePost = updatePost;
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const images = (0, cloudinary_1.getCloudinaryImage)(req);
    const { userId } = req;
    const { title, content } = req.body;
    const result = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const post = yield tx.post.create({
            data: {
                content,
                title,
                authorId: Number(userId),
            },
        });
        if (images && images.length > 0) {
            yield tx.image.createMany({
                data: images.map((src) => ({ postId: post.id, src })),
            });
            post.images = images.map((src) => ({ src }));
        }
        return post;
    }));
    return res
        .status(201)
        .json(new response_1.ApiResponse(result, 201, "Post successfully created."));
});
exports.createPost = createPost;
const deletePostImageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { imageId, postId } = req.params;
    const deletedImage = yield image_models_1.default.delete({
        where: {
            id: Number(imageId),
            postId: Number(postId),
        },
    });
    yield cloudinary_1.default.uploader.destroy(deletedImage.src);
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.deletePostImageById = deletePostImageById;
const deletePostImagesByPostId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const images = yield image_models_1.default.findMany({
        where: {
            postId: Number(postId),
        },
    });
    yield image_models_1.default.deleteMany({
        where: {
            postId: Number(postId),
        },
    });
    yield Promise.all(images.map((img) => __awaiter(void 0, void 0, void 0, function* () {
        yield cloudinary_1.default.uploader.destroy(img.src);
    })));
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.deletePostImagesByPostId = deletePostImagesByPostId;

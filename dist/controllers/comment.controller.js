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
exports.createReplyComment = exports.createComment = exports.updateComment = exports.deleteComment = exports.getComment = void 0;
const comment_models_1 = __importStar(require("../models/comment.models"));
const comment_utils_1 = require("../utils/comment/comment.utils");
const response_1 = require("../utils/response");
const post_utils_1 = require("../utils/post/post.utils");
const notification_utils_1 = require("../utils/notification/notification.utils");
const cloudinary_1 = __importStar(require("../lib/cloudinary"));
const getComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { commentId } = req.params;
    const comment = yield (0, comment_utils_1.findCommentById)(Number(commentId), Number(userId));
    return res.status(200).json(new response_1.ApiResponse(comment, 200));
});
exports.getComment = getComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { commentId } = req.params;
    const deletedComment = yield comment_models_1.default.delete({
        where: {
            id: Number(commentId),
        },
        include: {
            image: {
                select: { src: true },
            },
        },
    });
    if ((_a = deletedComment.image) === null || _a === void 0 ? void 0 : _a.src) {
        yield cloudinary_1.default.uploader.destroy(deletedComment.image.src);
    }
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Comment successfully deleted."));
});
exports.deleteComment = deleteComment;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment } = req.body;
    const { commentId } = req.params;
    const cId = Number(commentId);
    yield comment_models_1.default.update({
        where: {
            id: cId,
        },
        data: {
            comment,
        },
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Comment successfully updated."));
});
exports.updateComment = updateComment;
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const image = (_b = (0, cloudinary_1.getCloudinaryImage)(req)) === null || _b === void 0 ? void 0 : _b[0];
    const { userId } = req;
    const { comment, postId, parentId, imageSrc } = req.body;
    const pId = Number(postId);
    const prId = Number(parentId);
    const uId = Number(userId);
    if (parentId) {
        yield (0, comment_utils_1.checkCommentIsFound)({
            customMessage: {
                message: "Can't found comment with provided parentId",
                statusCode: 404,
            },
            commentId: prId,
            currentUserId: uId,
        });
    }
    yield (0, post_utils_1.checkPostIsFound)({
        customMessage: {
            message: "Can't found post with provided postId",
            statusCode: 404,
        },
        postId: pId,
        currentUserId: uId,
    });
    const result = yield (0, comment_models_1.createOneComment)({
        comment,
        postId: pId,
        userId: uId,
        image: imageSrc ? imageSrc : image,
        parentId: parentId || parentId === 0 ? prId : null,
    });
    yield (0, notification_utils_1.notify)(req, {
        type: "comment",
        commentId: result.id,
        postId: result.postId,
        receiverId: (_c = result.post) === null || _c === void 0 ? void 0 : _c.authorId,
        userId: uId,
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(result, 201, "Comment successfully created."));
});
exports.createComment = createComment;
const createReplyComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const image = (_d = (0, cloudinary_1.getCloudinaryImage)(req)) === null || _d === void 0 ? void 0 : _d[0];
    const { userId } = req;
    const { commentId } = req.params;
    const { comment, imageSrc } = req.body;
    const uId = Number(userId);
    const currentComment = yield (0, comment_utils_1.checkCommentIsFound)({
        commentId: Number(commentId),
        currentUserId: uId,
    });
    const result = yield (0, comment_models_1.createOneComment)({
        comment,
        postId: currentComment.postId,
        userId: uId,
        image: imageSrc ? imageSrc : image,
        parentId: currentComment.id,
    });
    yield (0, notification_utils_1.notify)(req, {
        type: "replying_comment",
        commentId: result.id,
        postId: result.postId,
        receiverId: (_e = result.post) === null || _e === void 0 ? void 0 : _e.authorId,
        userId: uId,
    });
    return res
        .status(201)
        .json(new response_1.ApiResponse(result, 201, "Comment successfully created."));
});
exports.createReplyComment = createReplyComment;

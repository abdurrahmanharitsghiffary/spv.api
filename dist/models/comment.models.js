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
exports.CommentLike = exports.createOneComment = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const Comment = prismaClient_1.default.comment;
const CommentLike = prismaClient_1.default.commentLike;
exports.CommentLike = CommentLike;
const createOneComment = ({ comment, postId, userId, parentId, image, }) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const createdComment = yield tx.comment.create({
            data: {
                comment,
                parentId,
                postId,
                userId,
            },
            include: {
                post: {
                    select: {
                        authorId: true,
                    },
                },
            },
        });
        if (image) {
            yield tx.image.create({
                data: {
                    src: image,
                    commentId: createdComment.id,
                },
            });
        }
        return createdComment;
    }));
});
exports.createOneComment = createOneComment;
exports.default = Comment;

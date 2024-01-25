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
exports.normalizeComments = exports.normalizeComment = void 0;
const normalize = (comment) => new Promise((resolve) => {
    var _a;
    const normalizedComment = {
        id: comment.id,
        postId: comment.postId,
        comment: comment.comment,
        image: comment === null || comment === void 0 ? void 0 : comment.image,
        user: {
            id: comment.user.id,
            fullName: comment.user.fullName,
            isOnline: comment.user.isOnline,
            firstName: comment.user.firstName,
            lastName: comment.user.lastName,
            username: comment.user.username,
            avatarImage: (_a = comment.user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage,
        },
        total_likes: comment._count.likes,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        replies: {
            ids: comment.childrenComment.map((comment) => comment.id),
            total: comment._count.childrenComment,
        },
    };
    return resolve(normalizedComment);
});
const normalizeComment = (comment) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedComment = yield normalize(comment);
    return normalizedComment;
});
exports.normalizeComment = normalizeComment;
const normalizeComments = (comments) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedComments = yield Promise.all(comments.map((comment) => Promise.resolve(normalize(comment))));
    return normalizedComments;
});
exports.normalizeComments = normalizeComments;

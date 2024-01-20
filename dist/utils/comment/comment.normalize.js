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
const __1 = require("..");
const normalize = (comment) => new Promise((resolve) => {
    var _a, _b, _c, _d, _e;
    const normalizedComment = {
        id: comment.id,
        postId: comment.postId,
        comment: comment.comment,
        image: (0, __1.getCompleteFileUrlPath)(comment === null || comment === void 0 ? void 0 : comment.image),
        isLiked: ((_b = (_a = comment.likes) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.userId) ? true : false,
        user: {
            id: comment.user.id,
            isFollowed: ((_d = (_c = comment.user.followedBy) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id) ? true : false,
            fullName: comment.user.fullName,
            isOnline: comment.user.isOnline,
            firstName: comment.user.firstName,
            lastName: comment.user.lastName,
            username: comment.user.username,
            avatarImage: (0, __1.getCompleteFileUrlPath)((_e = comment.user.profile) === null || _e === void 0 ? void 0 : _e.avatarImage),
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
// if (normalizedComment.user.avatarImage)
//   normalizedComment.user.avatarImage = {
//     src: new URL(normalizedComment.user.avatarImage.src, BASE_URL).href,
//   };
// if (comment.image) {
//   normalizedComment.image = { src: new URL(comment.image.src, BASE_URL).href };
// }
// comments: comment.childrenComment.map((comment) => {
//   const normalizedChildComment = {
//     id: comment.id,
//     postId: comment.postId,
//     image: comment.image,
//     comment: comment.comment,
//     user: {
//       id: comment.user.id,
//       username: comment.user.username,
//       image: comment.user.profile?.avatarImage,
//     },
//     total_likes: comment._count.likes,
//     createdAt: comment.createdAt,
//     updateAt: comment.updatedAt,
//     commentReply: {
//       commentIds: comment.childrenComment.map((comment) => comment.id),
//       total: comment._count.childrenComment,
//     },
//   };
//   if (normalizedChildComment.user.image)
//     normalizedChildComment.user.image = {
//       src: new URL(normalizedChildComment.user.image.src, BASE_URL).href,
//     };
//   if (comment.image) {
//     normalizedChildComment.image = {
//       src: new URL(comment.image.src, BASE_URL).href,
//     };
//   }
//   return normalizedChildComment;
// }),
// total: comment._count.childrenComment,

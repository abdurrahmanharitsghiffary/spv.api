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
exports.normalizePost = void 0;
const normalize = (post) => new Promise((resolve) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const normalizedPost = {
        id: post === null || post === void 0 ? void 0 : post.id,
        title: post === null || post === void 0 ? void 0 : post.title,
        content: post === null || post === void 0 ? void 0 : post.content,
        images: (_a = post === null || post === void 0 ? void 0 : post.images) !== null && _a !== void 0 ? _a : [],
        author: {
            id: post === null || post === void 0 ? void 0 : post.author.id,
            fullName: (_b = post === null || post === void 0 ? void 0 : post.author) === null || _b === void 0 ? void 0 : _b.fullName,
            isOnline: (_c = post === null || post === void 0 ? void 0 : post.author) === null || _c === void 0 ? void 0 : _c.isOnline,
            firstName: (_d = post === null || post === void 0 ? void 0 : post.author) === null || _d === void 0 ? void 0 : _d.firstName,
            lastName: (_e = post === null || post === void 0 ? void 0 : post.author) === null || _e === void 0 ? void 0 : _e.lastName,
            username: post === null || post === void 0 ? void 0 : post.author.username,
            avatarImage: (_g = (_f = post === null || post === void 0 ? void 0 : post.author) === null || _f === void 0 ? void 0 : _f.profile) === null || _g === void 0 ? void 0 : _g.avatarImage,
        },
        total_likes: post._count.likes,
        total_comments: post._count.comments,
        updatedAt: post === null || post === void 0 ? void 0 : post.updatedAt,
        createdAt: post === null || post === void 0 ? void 0 : post.createdAt,
    };
    // @ts-ignore
    if (post === null || post === void 0 ? void 0 : post.assignedAt) {
        // @ts-ignore
        normalizedPost.assignedAt = post.assignedAt;
    }
    return resolve(normalizedPost);
});
const normalizePost = (post) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedPost = yield normalize(post);
    return normalizedPost;
});
exports.normalizePost = normalizePost;

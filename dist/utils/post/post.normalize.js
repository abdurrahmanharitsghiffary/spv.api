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
const __1 = require("..");
const normalize = (post) => new Promise((resolve) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    console.log(post, "\nPost ext payload\n");
    const normalizedPost = {
        id: post === null || post === void 0 ? void 0 : post.id,
        title: post === null || post === void 0 ? void 0 : post.title,
        content: post === null || post === void 0 ? void 0 : post.content,
        images: ((_a = post === null || post === void 0 ? void 0 : post.images) !== null && _a !== void 0 ? _a : []).map((image) => (0, __1.getCompleteFileUrlPath)(image)),
        isBookmarked: ((_c = (_b = post === null || post === void 0 ? void 0 : post.follower) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.userId) ? true : false,
        isLiked: ((_e = (_d = post === null || post === void 0 ? void 0 : post.likes) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.userId) ? true : false,
        author: {
            isFollowed: ((_h = (_g = (_f = post === null || post === void 0 ? void 0 : post.author) === null || _f === void 0 ? void 0 : _f.followedBy) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.id) ? true : false,
            id: post === null || post === void 0 ? void 0 : post.author.id,
            fullName: (_j = post === null || post === void 0 ? void 0 : post.author) === null || _j === void 0 ? void 0 : _j.fullName,
            isOnline: (_k = post === null || post === void 0 ? void 0 : post.author) === null || _k === void 0 ? void 0 : _k.isOnline,
            firstName: (_l = post === null || post === void 0 ? void 0 : post.author) === null || _l === void 0 ? void 0 : _l.firstName,
            lastName: (_m = post === null || post === void 0 ? void 0 : post.author) === null || _m === void 0 ? void 0 : _m.lastName,
            username: post === null || post === void 0 ? void 0 : post.author.username,
            avatarImage: (0, __1.getCompleteFileUrlPath)((_p = (_o = post === null || post === void 0 ? void 0 : post.author) === null || _o === void 0 ? void 0 : _o.profile) === null || _p === void 0 ? void 0 : _p.avatarImage),
        },
        total_likes: post._count.likes,
        comments: {
            ids: post.comments.map((comment) => comment.id),
            total: (_q = post._count.comments) !== null && _q !== void 0 ? _q : 0,
        },
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

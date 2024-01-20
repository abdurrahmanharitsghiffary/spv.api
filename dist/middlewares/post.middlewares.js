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
exports.protectPost = void 0;
const error_1 = require("../lib/error");
const post_utils_1 = require("../utils/post/post.utils");
const protectPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const { userId } = req;
    const post = yield (0, post_utils_1.findPostById)(postId, Number(userId));
    if ((post === null || post === void 0 ? void 0 : post.author.id) !== Number(userId))
        throw new error_1.ForbiddenError();
    return next();
});
exports.protectPost = protectPost;

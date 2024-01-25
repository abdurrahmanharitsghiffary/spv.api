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
exports.protectComment = void 0;
const error_1 = require("../lib/error");
const comment_utils_1 = require("../utils/comment/comment.utils");
const protectComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { commentId } = req.params;
    const comment = yield (0, comment_utils_1.checkCommentIsFound)({
        commentId: Number(commentId),
        currentUserId: Number(userId),
    });
    if ((comment === null || comment === void 0 ? void 0 : comment.userId) !== Number(userId))
        throw new error_1.ForbiddenError();
    return next();
});
exports.protectComment = protectComment;

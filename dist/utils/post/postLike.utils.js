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
exports.findPostIsLiked = void 0;
const error_1 = require("../../lib/error");
const messages_1 = require("../../lib/messages");
const user_1 = require("../../lib/query/user");
const post_models_1 = __importDefault(require("../../models/post.models"));
const findPostIsLiked = (pId, uId) => __awaiter(void 0, void 0, void 0, function* () {
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
            likes: {
                select: { userId: true },
                where: {
                    userId: uId,
                },
            },
        },
    });
    if (!post)
        throw new error_1.RequestError(messages_1.NotFound.POST, 404);
    return post;
});
exports.findPostIsLiked = findPostIsLiked;

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
exports.normalizeNotification = void 0;
const user_normalize_1 = require("../user/user.normalize");
const normalizeNotification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
        const normalizedNotification = {
            type: payload.type,
            senderId: payload.userId,
            receiverId: payload.receiverId,
            isRead: payload.isRead,
            id: payload.id,
            createdAt: payload.createdAt,
            updatedAt: payload.updatedAt,
        };
        if (["liking_comment", "replying_comment", "comment"].includes(normalizedNotification.type)) {
            normalizedNotification.commentId = payload.commentId;
            normalizedNotification.postId = payload.postId;
        }
        if (normalizedNotification.type === "liking_post") {
            normalizedNotification.postId = payload.postId;
        }
        const sender = yield (0, user_normalize_1.simplifyUserWF)(payload.user);
        const receiver = yield (0, user_normalize_1.simplifyUserWF)(payload.receiver);
        return resolve(Object.assign(Object.assign({}, normalizedNotification), { sender,
            receiver }));
    }));
});
exports.normalizeNotification = normalizeNotification;

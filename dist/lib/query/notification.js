"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectNotification = exports.selectNotificationSimplified = void 0;
const comment_1 = require("./comment");
const post_1 = require("./post");
const user_1 = require("./user");
exports.selectNotificationSimplified = {
    id: true,
    commentId: true,
    createdAt: true,
    isRead: true,
    postId: true,
    receiverId: true,
    type: true,
    userId: true,
    groupId: true,
    updatedAt: true,
    receiver: {
        select: Object.assign({}, user_1.selectUserSimplified),
    },
    user: {
        select: Object.assign({}, user_1.selectUserSimplified),
    },
};
exports.selectNotification = {
    type: true,
    id: true,
    comment: {
        select: Object.assign({}, comment_1.selectSingleComment),
    },
    groupId: true,
    createdAt: true,
    isRead: true,
    post: {
        select: Object.assign(Object.assign({}, post_1.selectPost), { comments: false }),
    },
    receiver: {
        select: Object.assign({}, user_1.selectUserSimplified),
    },
    user: {
        select: Object.assign({}, user_1.selectUserSimplified),
    },
    updatedAt: true,
};

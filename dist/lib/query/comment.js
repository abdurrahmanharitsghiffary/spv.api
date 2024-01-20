"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectComment = exports.selectSingleComment = void 0;
const user_1 = require("./user");
exports.selectSingleComment = {
    id: true,
    postId: true,
    comment: true,
    createdAt: true,
    image: { select: { src: true } },
    user: {
        select: Object.assign({}, user_1.selectUserSimplified),
    },
    updatedAt: true,
    _count: true,
};
exports.selectComment = Object.assign(Object.assign({}, exports.selectSingleComment), { childrenComment: {
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
        },
    } });

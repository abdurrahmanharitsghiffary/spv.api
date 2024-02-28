"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectGroupMembershipRequest = exports.selectAppRequest = void 0;
// import { selectChatRoom } from "./chat";
const user_1 = require("./user");
exports.selectAppRequest = {
    comment: true,
    id: true,
    createdAt: true,
    user: { select: Object.assign({}, user_1.selectUserSimplified) },
    type: true,
    status: true,
    updatedAt: true,
};
exports.selectGroupMembershipRequest = Object.assign(Object.assign({}, exports.selectAppRequest), { groupId: true });

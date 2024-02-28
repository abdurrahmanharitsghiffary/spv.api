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
exports.normalizeMembershipRequest = exports.normalizeAppRequest = void 0;
const user_normalize_1 = require("../user/user.normalize");
const normalizeAppRequest = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.resolve({
        id: payload.id,
        sender: yield (0, user_normalize_1.simplifyUser)(payload.user),
        comment: payload.comment,
        status: payload.status,
        createdAt: payload.createdAt,
        type: payload.type,
        updatedAt: payload.updatedAt,
    });
});
exports.normalizeAppRequest = normalizeAppRequest;
const normalizeMembershipRequest = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return Promise.resolve({
        id: payload.id,
        sender: yield (0, user_normalize_1.simplifyUser)(payload.user),
        comment: payload.comment,
        status: payload.status,
        createdAt: payload.createdAt,
        type: payload.type,
        groupId: payload.groupId,
        updatedAt: payload.updatedAt,
    });
});
exports.normalizeMembershipRequest = normalizeMembershipRequest;

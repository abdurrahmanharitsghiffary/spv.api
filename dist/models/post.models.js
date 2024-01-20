"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostLike = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const Post = prismaClient_1.default.post;
exports.PostLike = prismaClient_1.default.postLike;
exports.default = Post;

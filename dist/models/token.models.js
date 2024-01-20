"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const Token = prismaClient_1.default.token;
exports.RefreshToken = prismaClient_1.default.refreshToken;
exports.default = Token;

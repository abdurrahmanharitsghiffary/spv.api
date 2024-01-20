"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoverImage = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const Image = prismaClient_1.default.image;
exports.CoverImage = prismaClient_1.default.coverImage;
exports.default = Image;

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
exports.isUserBlockOrBlocked_Body = exports.isUserBlockOrBlocked_Params = void 0;
const handler_middlewares_1 = require("./handler.middlewares");
const user_models_1 = __importDefault(require("../models/user.models"));
const response_1 = require("../utils/response");
const blockedMessage = "You do not have permission to access this user's information because you have been blocked by this user.";
const blockingMessage = "You do not have permission to access this user's information because you have blocked them.";
const blockingResponse = (res, customMessage) => res.status(403).json(new response_1.ApiError(403, customMessage !== null && customMessage !== void 0 ? customMessage : blockingMessage));
const blockedResponse = (res, customMessage) => res.status(403).json(new response_1.ApiError(403, customMessage !== null && customMessage !== void 0 ? customMessage : blockedMessage));
const isBlockingUser = ({ currentUserId, blockedUserId, }) => user_models_1.default.findUnique({
    where: {
        id: Number(currentUserId),
    },
    select: {
        id: true,
        blocked: {
            select: {
                id: true,
            },
            where: {
                id: Number(blockedUserId),
            },
        },
    },
});
const isBlockedByUser = ({ currentUserId, blockingUserId, }) => user_models_1.default.findUnique({
    where: {
        id: Number(currentUserId),
    },
    select: {
        id: true,
        blocking: {
            select: {
                id: true,
            },
            where: {
                id: Number(blockingUserId),
            },
        },
    },
});
const isUserBlockOrBlocked_Params = (paramsKey = "userId", customMessage) => (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId: loggedUserId } = req;
    const blockingUser = yield isBlockingUser({
        blockedUserId: Number(req.params[paramsKey]),
        currentUserId: Number(loggedUserId),
    });
    const isBlocking = ((_a = blockingUser === null || blockingUser === void 0 ? void 0 : blockingUser.blocked) !== null && _a !== void 0 ? _a : []).length > 0 ? true : false;
    const blockedUser = yield isBlockedByUser({
        blockingUserId: Number(req.params[paramsKey]),
        currentUserId: Number(loggedUserId),
    });
    const isBlocked = ((_b = blockedUser === null || blockedUser === void 0 ? void 0 : blockedUser.blocking) !== null && _b !== void 0 ? _b : []).length > 0 ? true : false;
    if (isBlocked)
        return blockedResponse(res, customMessage === null || customMessage === void 0 ? void 0 : customMessage.blockedMessage);
    if (isBlocking)
        return blockingResponse(res, customMessage === null || customMessage === void 0 ? void 0 : customMessage.blockingMessage);
    return next();
}));
exports.isUserBlockOrBlocked_Params = isUserBlockOrBlocked_Params;
const isUserBlockOrBlocked_Body = (bodyKey, customMessage) => (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { userId: loggedUserId } = req;
    const blockingUser = yield isBlockingUser({
        blockedUserId: Number(req.body[bodyKey]),
        currentUserId: Number(loggedUserId),
    });
    const isBlocking = ((_c = blockingUser === null || blockingUser === void 0 ? void 0 : blockingUser.blocked) !== null && _c !== void 0 ? _c : []).length > 0 ? true : false;
    const blockedUser = yield isBlockedByUser({
        blockingUserId: Number(req.body[bodyKey]),
        currentUserId: Number(loggedUserId),
    });
    const isBlocked = ((_d = blockedUser === null || blockedUser === void 0 ? void 0 : blockedUser.blocking) !== null && _d !== void 0 ? _d : []).length > 0 ? true : false;
    if (isBlocked)
        return blockedResponse(res, customMessage === null || customMessage === void 0 ? void 0 : customMessage.blockedMessage);
    if (isBlocking)
        return blockingResponse(res, customMessage === null || customMessage === void 0 ? void 0 : customMessage.blockingMessage);
    return next();
}));
exports.isUserBlockOrBlocked_Body = isUserBlockOrBlocked_Body;

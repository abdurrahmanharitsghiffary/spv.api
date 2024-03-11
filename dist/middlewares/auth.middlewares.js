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
exports.verifyRefreshToken = exports.isAdmin = exports.verifyToken = exports.verifyTokenOptional = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_models_1 = __importDefault(require("../models/user.models"));
const handler_middlewares_1 = require("./handler.middlewares");
const error_1 = require("../lib/error");
const consts_1 = require("../lib/consts");
exports.verifyTokenOptional = (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (token) {
        const decode = yield jsonwebtoken_1.default.verify(token, consts_1.ACCESS_TOKEN_SECRET);
        req.userEmail = decode.email;
        req.userId = decode.id;
        const isUserExist = yield user_models_1.default.findUnique({
            where: {
                email: decode.email,
            },
        });
        if (!isUserExist)
            throw new error_1.UnauthorizedError();
        req.role = isUserExist.role;
        return next();
    }
    else {
        return next();
    }
}));
exports.verifyToken = (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const token = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(" ")[1];
    if (!token)
        throw new error_1.RequestError("No token provided!", 401);
    const decode = yield jsonwebtoken_1.default.verify(token, consts_1.ACCESS_TOKEN_SECRET);
    req.userEmail = decode.email;
    req.userId = decode.id;
    const isUserExist = yield user_models_1.default.findUnique({
        where: {
            email: decode.email,
        },
    });
    if (!isUserExist)
        throw new error_1.UnauthorizedError();
    req.role = isUserExist.role;
    next();
}));
exports.isAdmin = (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.role === "admin")
        return next();
    throw new error_1.ForbiddenError();
}));
exports.verifyRefreshToken = (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies["x.spv.session"];
    if (!token)
        throw new error_1.RequestError("You are unauthenticated!", 401);
    // const tokenIsExist = await RefreshToken.findUnique({
    //   where: {
    //     refreshToken: token,
    //   },
    // });
    // if (!tokenIsExist) throw new RequestError("Invalid refresh token", 401);
    const decodedToken = yield jsonwebtoken_1.default.verify(token, consts_1.REFRESH_TOKEN_SECRET);
    req.userEmail = decodedToken.email;
    next();
}));

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
exports.signOut = exports.refreshToken = exports.signUp = exports.login = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const error_1 = require("../lib/error");
const bcrypt_1 = __importDefault(require("bcrypt"));
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const response_1 = require("../utils/response");
const utils_1 = require("../utils");
const consts_1 = require("../lib/consts");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_models_1.default.findUnique({
        where: {
            email,
            provider: {
                equals: null,
            },
        },
        include: {
            profile: {
                include: {
                    avatarImage: true,
                },
            },
            refreshToken: true,
        },
    });
    if (!user)
        throw new error_1.RequestError("Invalid Credentials", 401);
    const passwordIsMatch = yield bcrypt_1.default.compare(password, user.hashedPassword);
    if (!passwordIsMatch)
        throw new error_1.RequestError("Invalid Credentials", 401);
    const access_token = yield (0, utils_1.generateAccessToken)({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email,
        username: user.username,
    });
    const refresh_token = yield (0, utils_1.generateRefreshToken)({
        id: user.id,
        email,
        lastName: user.lastName,
        fullName: user.fullName,
        firstName: user.firstName,
        username: user.username,
    });
    res.cookie("x.spv.session", refresh_token, {
        sameSite: "none",
        // secure: true,
        httpOnly: true,
        maxAge: 60000 * 60 * 24 * 7,
    });
    return res.status(200).json(new response_1.ApiResponse({
        access_token,
        token_type: "Bearer",
        expires_in: 3600,
    }, 200, "Login successfull."));
});
exports.login = login;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username, firstName, lastName, birthDate, gender } = req.body;
    const isUserExists = yield user_models_1.default.findUnique({
        where: { email },
    });
    if (isUserExists)
        throw new error_1.RequestError("Email already registered.", 409);
    const hashedPassword = yield bcrypt_1.default.hash(password, Number(consts_1.BCRYPT_SALT));
    const user = yield user_models_1.default.create({
        data: {
            firstName,
            lastName,
            fullName: (0, utils_1.getFullName)(firstName, lastName),
            email,
            hashedPassword,
            username,
            profile: { create: { profileDescription: null, birthDate, gender } },
        },
    });
    const refresh_token = yield (0, utils_1.generateRefreshToken)({
        id: user.id,
        firstName,
        fullName: user.fullName,
        lastName,
        email,
        username,
    });
    const access_token = yield (0, utils_1.generateAccessToken)({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email,
        username,
    });
    res.cookie("x.spv.session", refresh_token, {
        sameSite: "none",
        // secure: true,
        httpOnly: true,
        maxAge: 60000 * 60 * 24 * 7,
    });
    return res.status(201).json(new response_1.ApiResponse({
        access_token,
        token_type: "Bearer",
        expires_in: 3600,
    }, 201, "User successfully registered."));
});
exports.signUp = signUp;
exports.refreshToken = (0, handler_middlewares_1.tryCatch)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userEmail } = req;
    const user = yield user_models_1.default.findUnique({
        where: {
            email: userEmail,
        },
    });
    const access_token = yield (0, utils_1.generateAccessToken)({
        firstName: user === null || user === void 0 ? void 0 : user.firstName,
        lastName: user === null || user === void 0 ? void 0 : user.lastName,
        id: user === null || user === void 0 ? void 0 : user.id,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        username: user === null || user === void 0 ? void 0 : user.username,
        email: user === null || user === void 0 ? void 0 : user.email,
    });
    return res.status(200).json(new response_1.ApiResponse({
        access_token,
        expires_in: 3600,
    }, 200));
}));
const signOut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies["x.spv.session"];
    if (!token)
        throw new error_1.RequestError("You are unauthenticated!", 401);
    res.clearCookie("x.spv.session", {
        sameSite: "none",
        secure: true,
        httpOnly: true,
        maxAge: 60000 * 60 * 24 * 7,
    });
    return res.status(200).json(new response_1.ApiResponse(null, 200, "Logout success."));
});
exports.signOut = signOut;

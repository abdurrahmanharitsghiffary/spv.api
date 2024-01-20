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
exports.googleAuthCallback = exports.deleteGoogleAccount = void 0;
const response_1 = require("../utils/response");
const user_models_1 = __importDefault(require("../models/user.models"));
const error_1 = require("../lib/error");
const utils_1 = require("../utils");
const consts_1 = require("../lib/consts");
const deleteGoogleAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const user = yield user_models_1.default.findUnique({
        where: {
            id: Number(userId),
        },
    });
    if ((user === null || user === void 0 ? void 0 : user.googleId) === null || (user === null || user === void 0 ? void 0 : user.provider) === null)
        throw new error_1.RequestError("Email is not google associated account.", 403);
    if (!user)
        throw new error_1.RequestError("Something went wrong!", 400);
    yield user_models_1.default.delete({
        where: {
            id: Number(userId),
            provider: "GOOGLE",
            googleId: user.googleId,
        },
    });
    res.clearCookie("x.spv.session", {
        sameSite: "strict",
        secure: true,
        httpOnly: true,
        maxAge: 60000 * 60 * 24 * 7,
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Account successfully deleted."));
});
exports.deleteGoogleAccount = deleteGoogleAccount;
const googleAuthCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const userJson = (_b = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._json) !== null && _b !== void 0 ? _b : {};
        let user = yield user_models_1.default.findUnique({
            where: {
                googleId: userJson.sub,
            },
        });
        if (!user) {
            const newUser = yield user_models_1.default.create({
                data: {
                    verified: true,
                    email: userJson === null || userJson === void 0 ? void 0 : userJson.email,
                    firstName: userJson === null || userJson === void 0 ? void 0 : userJson.given_name,
                    lastName: userJson === null || userJson === void 0 ? void 0 : userJson.family_name,
                    hashedPassword: "",
                    provider: "GOOGLE",
                    profile: {
                        create: {
                            avatarImage: {
                                create: {
                                    src: userJson === null || userJson === void 0 ? void 0 : userJson.picture,
                                },
                            },
                        },
                    },
                    username: (_c = userJson === null || userJson === void 0 ? void 0 : userJson.email) === null || _c === void 0 ? void 0 : _c.split("@")[0],
                    googleId: userJson === null || userJson === void 0 ? void 0 : userJson.sub,
                },
            });
            user = newUser;
        }
        console.log(user);
        // const access_token = await generateAccessToken({
        //   id: user.id,
        //   firstName: user.firstName,
        //   lastName: user.lastName,
        //   fullName: user.fullName,
        //   email: user.email,
        //   username: user.username,
        // });
        const refresh_token = yield (0, utils_1.generateRefreshToken)({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
        });
        res.cookie("x.spv.session", refresh_token, {
            sameSite: "strict",
            secure: true,
            httpOnly: true,
            maxAge: 60000 * 60 * 24 * 7,
        });
        res.redirect(consts_1.BASE_CLIENT_URL);
    }
    catch (err) {
        console.log(err === null || err === void 0 ? void 0 : err.message, " Error login");
        const message = ((_d = err === null || err === void 0 ? void 0 : err.message) === null || _d === void 0 ? void 0 : _d.includes("Unique constraint failed on the constraint: `users_email_key`"))
            ? "Email already registered."
            : "";
        res.redirect(`${consts_1.BASE_CLIENT_URL}/login?err_message=${message}`);
    }
});
exports.googleAuthCallback = googleAuthCallback;

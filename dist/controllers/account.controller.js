"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.sendVerifyToken = exports.verifyAccount = exports.changeMyAccountPassword = exports.deleteAccountImage = exports.deleteMyAccount = exports.updateMyAccount = exports.updateAccountImage = exports.getMyAccountInfo = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const user_utils_1 = require("../utils/user/user.utils");
const image_models_1 = __importDefault(require("../models/image.models"));
const error_1 = require("../lib/error");
const token_models_1 = __importDefault(require("../models/token.models"));
const utils_1 = require("../utils");
const email_utils_1 = require("../utils/email.utils");
const response_1 = require("../utils/response");
const bcrypt = __importStar(require("bcrypt"));
const image_models_2 = require("../models/image.models");
const consts_1 = require("../lib/consts");
const messages_1 = require("../lib/messages");
const cloudinary_1 = __importStar(require("../lib/cloudinary"));
const getMyAccountInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const myAccount = yield (0, user_utils_1.findUserById)(Number(userId));
    return res.status(200).json(new response_1.ApiResponse(myAccount, 200));
});
exports.getMyAccountInfo = getMyAccountInfo;
const updateAccountImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { userId, userEmail } = req;
    const { type = "profile" } = req.query;
    let src;
    const image = (_a = (0, cloudinary_1.getCloudinaryImage)(req)) === null || _a === void 0 ? void 0 : _a[0];
    const user = yield (0, user_utils_1.checkIsUserFound)({
        userId: Number(userId),
        currentUserId: Number(userId),
        select: { profile: { select: { avatarImage: { select: { src: true } } } } },
    });
    if (!user)
        throw new error_1.RequestError("Something went wrong!", 404);
    if (type === "profile") {
        if (image) {
            src = (_c = (_b = user === null || user === void 0 ? void 0 : user.profile) === null || _b === void 0 ? void 0 : _b.avatarImage) === null || _c === void 0 ? void 0 : _c.src;
            yield user_models_1.default.update({
                where: {
                    email: userEmail,
                },
                data: {
                    profile: {
                        update: {
                            avatarImage: {
                                create: {
                                    src: image,
                                },
                            },
                        },
                    },
                },
            });
            if (src)
                yield cloudinary_1.default.uploader.destroy(src);
        }
    }
    else {
        if (image) {
            src = (_e = (_d = user === null || user === void 0 ? void 0 : user.profile) === null || _d === void 0 ? void 0 : _d.coverImage) === null || _e === void 0 ? void 0 : _e.src;
            yield user_models_1.default.update({
                where: {
                    email: userEmail,
                },
                data: {
                    profile: {
                        update: {
                            coverImage: {
                                create: {
                                    src: image,
                                },
                            },
                        },
                    },
                },
            });
            if (src)
                yield cloudinary_1.default.uploader.destroy(src);
        }
    }
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, `User ${type} image successfully updated.`));
});
exports.updateAccountImage = updateAccountImage;
const updateMyAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userEmail } = req;
    const { username, description, firstName, lastName, gender, birthDate } = req.body;
    yield user_models_1.default.update({
        where: {
            email: userEmail,
        },
        data: {
            username,
            firstName,
            lastName,
            profile: {
                update: {
                    gender,
                    birthDate,
                    profileDescription: description,
                },
            },
        },
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Account informations successfully updated."));
});
exports.updateMyAccount = updateMyAccount;
const deleteMyAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h, _j;
    const { userEmail } = req;
    const { currentPassword } = req.body;
    const user = yield user_models_1.default.findUnique({ where: { email: userEmail } });
    if (!user)
        throw new error_1.RequestError("Something went wrong!", 400);
    const isMatch = yield bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isMatch)
        throw new error_1.RequestError("Incorrect password. Please try again.", 400);
    res.clearCookie("x.spv.session", {
        sameSite: "none",
        secure: true,
        httpOnly: true,
        maxAge: 60000 * 60 * 24 * 7,
    });
    const deletedUser = yield user_models_1.default.delete({
        where: {
            email: userEmail,
        },
        include: {
            profile: {
                include: {
                    avatarImage: { select: { src: true } },
                    coverImage: { select: { src: true } },
                },
            },
        },
    });
    if ((_g = (_f = deletedUser.profile) === null || _f === void 0 ? void 0 : _f.coverImage) === null || _g === void 0 ? void 0 : _g.src) {
        yield cloudinary_1.default.uploader.destroy(deletedUser.profile.coverImage.src);
    }
    if ((_j = (_h = deletedUser.profile) === null || _h === void 0 ? void 0 : _h.avatarImage) === null || _j === void 0 ? void 0 : _j.src) {
        yield cloudinary_1.default.uploader.destroy(deletedUser.profile.avatarImage.src);
    }
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Account successfully deleted."));
});
exports.deleteMyAccount = deleteMyAccount;
const deleteAccountImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l;
    const { userEmail } = req;
    const { type = "profile" } = req.query;
    const user = yield user_models_1.default.findUnique({
        where: {
            email: userEmail,
        },
        include: {
            profile: {
                include: {
                    avatarImage: true,
                    coverImage: true,
                },
            },
        },
    });
    if (!user)
        throw new error_1.RequestError("Something went wrong!", 400);
    if (type === "profile") {
        if (!((_k = user === null || user === void 0 ? void 0 : user.profile) === null || _k === void 0 ? void 0 : _k.avatarImage))
            throw new error_1.RequestError(messages_1.NotFound.PROFILE_IMAGE, 404);
        if (user.profile)
            yield image_models_1.default.delete({
                where: {
                    profileId: user.profile.id,
                },
            });
        yield cloudinary_1.default.uploader.destroy(user.profile.avatarImage.src);
    }
    else {
        if (!((_l = user === null || user === void 0 ? void 0 : user.profile) === null || _l === void 0 ? void 0 : _l.coverImage))
            throw new error_1.RequestError(messages_1.NotFound.PROFILE_IMAGE, 404);
        if (user.profile)
            yield image_models_2.CoverImage.delete({
                where: {
                    profileId: user.profile.id,
                },
            });
        yield cloudinary_1.default.uploader.destroy(user.profile.coverImage.src);
    }
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, `${type} image successfully deleted.`));
});
exports.deleteAccountImage = deleteAccountImage;
const changeMyAccountPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userEmail } = req;
    const { currentPassword, password } = req.body;
    const user = yield user_models_1.default.findUnique({
        where: {
            email: userEmail,
            provider: {
                equals: null,
            },
        },
    });
    if (!user)
        throw new error_1.RequestError("Something went wrong!", 400);
    const isMatch = yield bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isMatch)
        throw new error_1.RequestError("Incorrect password. Please try again", 400);
    const hashedPassword = yield bcrypt.hash(password, Number(consts_1.BCRYPT_SALT));
    yield user_models_1.default.update({
        where: {
            email: userEmail,
        },
        data: {
            hashedPassword,
        },
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Password successfully changed"));
});
exports.changeMyAccountPassword = changeMyAccountPassword;
const verifyAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { verifyToken } = req.params;
    const token = yield token_models_1.default.findUnique({
        where: {
            AND: {
                type: "verify_token",
            },
            token: verifyToken,
        },
        include: {
            user: true,
        },
    });
    if (!token)
        throw new error_1.RequestError("Invalid Token", 401);
    yield token_models_1.default.deleteMany({
        where: {
            userEmail: token === null || token === void 0 ? void 0 : token.userEmail,
            type: "verify_token",
        },
    });
    if (token === null || token === void 0 ? void 0 : token.user.verified)
        throw new error_1.RequestError("Email is already verified", 409);
    if (token.expires_in.getTime() < Date.now())
        throw new error_1.RequestError("Token expired", 401);
    yield user_models_1.default.update({
        where: {
            email: token.userEmail,
        },
        data: { verified: true },
    });
    return res
        .status(200)
        .json(new response_1.ApiResponse(null, 200, "Email verification successful. Your account has been verified."));
});
exports.verifyAccount = verifyAccount;
const sendVerifyToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_models_1.default.findUnique({
        where: {
            email,
        },
    });
    const token = yield (0, utils_1.getRandomToken)();
    if (user && !user.verified) {
        yield token_models_1.default.create({
            data: {
                type: "verify_token",
                expires_in: new Date(Date.now() + 300 * 1000),
                token,
                userEmail: email,
            },
        });
        yield (0, email_utils_1.sendVerifyEmail)(email, `${process.env.CLIENT_URL}/verify/${token}`);
    }
    res
        .status(200)
        .json(new response_1.ApiResponse(null, 200, `If a matching account was found & email is valid, an email was sent to ${email} to verify your email.`));
});
exports.sendVerifyToken = sendVerifyToken;

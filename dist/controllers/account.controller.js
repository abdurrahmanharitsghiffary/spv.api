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
const utils_1 = require("../utils");
const image_models_1 = __importDefault(require("../models/image.models"));
const error_1 = require("../lib/error");
const utils_2 = require("../utils");
const token_models_1 = __importDefault(require("../models/token.models"));
const utils_3 = require("../utils");
const email_utils_1 = require("../utils/email.utils");
const response_1 = require("../utils/response");
const bcrypt = __importStar(require("bcrypt"));
const image_models_2 = require("../models/image.models");
const consts_1 = require("../lib/consts");
const messages_1 = require("../lib/messages");
const getMyAccountInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const myAccount = yield (0, user_utils_1.findUserById)(Number(userId));
    return res.status(200).json(new response_1.ApiResponse(myAccount, 200));
});
exports.getMyAccountInfo = getMyAccountInfo;
const updateAccountImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { userId, userEmail } = req;
    const { type = "profile" } = req.query;
    let src;
    const image = req.file;
    const user = yield (0, user_utils_1.findUserById)(Number(userId));
    if (!user)
        throw new error_1.RequestError("Something went wrong!", 404);
    if (type === "profile") {
        if (image) {
            src = (_b = (_a = user === null || user === void 0 ? void 0 : user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage) === null || _b === void 0 ? void 0 : _b.src;
            yield user_models_1.default.update({
                where: {
                    email: userEmail,
                },
                data: {
                    profile: {
                        update: {
                            avatarImage: {
                                create: {
                                    src: (0, utils_1.getFileDest)(image),
                                },
                            },
                        },
                    },
                },
            });
            if (src)
                yield (0, utils_2.deleteUploadedImage)(src);
        }
    }
    else {
        if (image) {
            src = (_d = (_c = user === null || user === void 0 ? void 0 : user.profile) === null || _c === void 0 ? void 0 : _c.coverImage) === null || _d === void 0 ? void 0 : _d.src;
            yield user_models_1.default.update({
                where: {
                    email: userEmail,
                },
                data: {
                    profile: {
                        update: {
                            coverImage: {
                                create: {
                                    src: (0, utils_1.getFileDest)(image),
                                },
                            },
                        },
                    },
                },
            });
            if (src)
                yield (0, utils_2.deleteUploadedImage)(src);
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
    var _e, _f, _g, _h;
    const { userEmail } = req;
    const { currentPassword } = req.body;
    const user = yield user_models_1.default.findUnique({ where: { email: userEmail } });
    if (!user)
        throw new error_1.RequestError("Something went wrong!", 400);
    const isMatch = yield bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isMatch)
        throw new error_1.RequestError("Incorrect password. Please try again.", 400);
    res.clearCookie("x.spv.session", {
        sameSite: "strict",
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
    if ((_f = (_e = deletedUser.profile) === null || _e === void 0 ? void 0 : _e.coverImage) === null || _f === void 0 ? void 0 : _f.src) {
        yield (0, utils_2.deleteUploadedImage)(deletedUser.profile.coverImage.src);
    }
    if ((_h = (_g = deletedUser.profile) === null || _g === void 0 ? void 0 : _g.avatarImage) === null || _h === void 0 ? void 0 : _h.src) {
        yield (0, utils_2.deleteUploadedImage)(deletedUser.profile.avatarImage.src);
    }
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Account successfully deleted."));
});
exports.deleteMyAccount = deleteMyAccount;
const deleteAccountImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
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
        if (!((_j = user === null || user === void 0 ? void 0 : user.profile) === null || _j === void 0 ? void 0 : _j.avatarImage))
            throw new error_1.RequestError(messages_1.NotFound.PROFILE_IMAGE, 404);
        if (user.profile)
            yield image_models_1.default.delete({
                where: {
                    profileId: user.profile.id,
                },
            });
        yield (0, utils_2.deleteUploadedImage)(user.profile.avatarImage.src);
    }
    else {
        if (!((_k = user === null || user === void 0 ? void 0 : user.profile) === null || _k === void 0 ? void 0 : _k.coverImage))
            throw new error_1.RequestError(messages_1.NotFound.PROFILE_IMAGE, 404);
        if (user.profile)
            yield image_models_2.CoverImage.delete({
                where: {
                    profileId: user.profile.id,
                },
            });
        yield (0, utils_2.deleteUploadedImage)(user.profile.coverImage.src);
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
    const token = yield (0, utils_3.getRandomToken)();
    if (user && !user.verified) {
        yield token_models_1.default.create({
            data: {
                type: "verify_token",
                expires_in: new Date(Date.now() + 300 * 1000),
                token,
                userEmail: email,
            },
        });
        yield (0, email_utils_1.sendVerifyEmail)(email, `http://localhost:3000/verify/${token}`);
    }
    res
        .status(200)
        .json(new response_1.ApiResponse(null, 200, `If a matching account was found & email is valid, an email was sent to ${email} to verify your email.`));
});
exports.sendVerifyToken = sendVerifyToken;

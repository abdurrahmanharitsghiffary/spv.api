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
exports.resetPassword = exports.sendResetToken = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const email_utils_1 = require("../utils/email.utils");
const token_models_1 = __importDefault(require("../models/token.models"));
const error_1 = require("../lib/error");
const bcrypt_1 = __importDefault(require("bcrypt"));
const utils_1 = require("../utils");
const response_1 = require("../utils/response");
const consts_1 = require("../lib/consts");
const sendResetToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_models_1.default.findUnique({
        where: {
            email,
            provider: {
                equals: null,
            },
        },
    });
    const resetToken = yield (0, utils_1.getRandomToken)();
    const now = Date.now();
    if (user) {
        yield token_models_1.default.create({
            data: {
                token: resetToken,
                type: "reset_token",
                expires_in: new Date(now + 300 * 1000),
                userEmail: email,
            },
        });
        yield (0, email_utils_1.sendResetPasswordEmail)(email, `http://localhost:3000/resetpassword/${resetToken}`);
    }
    res
        .status(200)
        .json(new response_1.ApiResponse(null, 200, `If a matching account was found, an email was sent to ${email} to allow you to reset your password.`));
});
exports.sendResetToken = sendResetToken;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    if (confirmPassword !== password)
        throw new error_1.RequestError("Password and confirm password does not match", 422);
    const resetToken = yield token_models_1.default.findUnique({
        where: {
            AND: {
                type: "reset_token",
            },
            token,
        },
    });
    if (!resetToken)
        throw new error_1.RequestError("Invalid Token!", 401);
    if (resetToken.expires_in.getTime() < Date.now())
        throw new error_1.RequestError("Token already expired", 401);
    const hashedPassword = yield bcrypt_1.default.hash(password, Number(consts_1.BCRYPT_SALT));
    yield user_models_1.default.update({
        where: {
            email: resetToken.userEmail,
        },
        data: {
            hashedPassword,
        },
    });
    yield token_models_1.default.deleteMany({
        where: {
            userEmail: resetToken.userEmail,
            type: "reset_token",
        },
    });
    res
        .status(200)
        .json(new response_1.ApiResponse(null, 200, "Password successfully reset. You can now use the new password to log in."));
});
exports.resetPassword = resetPassword;

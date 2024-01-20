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
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = void 0;
const response_1 = require("../utils/response");
const consts_1 = require("../lib/consts");
const error = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let statusCode = (_a = err === null || err === void 0 ? void 0 : err.statusCode) !== null && _a !== void 0 ? _a : 400;
    let message = (_b = err === null || err === void 0 ? void 0 : err.message) !== null && _b !== void 0 ? _b : "";
    let name = (_c = err === null || err === void 0 ? void 0 : err.name) !== null && _c !== void 0 ? _c : "";
    let errors = (_d = err === null || err === void 0 ? void 0 : err.errors) !== null && _d !== void 0 ? _d : [];
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json(new response_1.ApiError(413, consts_1.errorsMessage.FILE_TOO_BIG));
    }
    console.log(message, "ErrMessage");
    console.log("Error: ", err);
    switch (name) {
        case "JsonWebTokenError":
            {
                statusCode = 401;
                message = "Invalid token.";
            }
            break;
        case "TokenExpiredError":
            {
                statusCode = 403;
                message = "Token expired.";
            }
            break;
        case "PrismaClientRustPanicError":
            {
                statusCode = 400;
            }
            break;
        case "PrismaClientKnownRequestError":
            {
                statusCode = 400;
            }
            break;
        case "PrismaClientUnknownRequestError":
            {
                statusCode = 400;
            }
            break;
        case "PrismaClientValidationError":
            {
                statusCode = 422;
            }
            break;
        case "PrismaClientInitializationError":
            {
                statusCode = 400;
            }
            break;
        case "ZodError":
            {
                statusCode = 422;
                errors = err.issues;
                name = err.name;
            }
            break;
        default: {
            if (!statusCode)
                statusCode = 500;
            if (!message)
                message = "Something went wrong!";
        }
    }
    return res
        .status(statusCode)
        .json(new response_1.ApiError(statusCode, message, errors, name));
});
exports.error = error;

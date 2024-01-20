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
const error = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.error(err.name, " Error Name");
    console.log(err, " Error");
    switch (err.name) {
        case "RequestError": {
            return res
                .status(err.statusCode)
                .json(new response_1.ApiError(err.statusCode, err.message));
        }
        case "JsonWebTokenError": {
            return res.status(401).json(new response_1.ApiError(401, "Invalid token"));
        }
        case "TokenExpiredError": {
            return res.status(403).json(new response_1.ApiError(403, "Token expired"));
        }
        case "PrismaClientKnownRequestError": {
            switch (err.code) {
                case "P2002": {
                    if (err.message.includes("Invalid `PostLike.create()`")) {
                        return res.status(404).json({
                            status: "fail",
                            data: {
                                message: `Post not found`,
                            },
                        });
                    }
                    else if (err.message.includes("Invalid `prisma.savedPost.create()`") &&
                        err.message.includes("Unique constraint failed on the constraint: `PRIMARY`")) {
                        return res.status(409).json({
                            status: "fail",
                            data: {
                                message: "You already saved this post",
                            },
                        });
                    }
                }
                case "P2003": {
                    if (err.message.includes("Invalid `Chat.create()`") &&
                        err.message.includes("const createdChat")) {
                        return res.status(404).json({
                            status: "fail",
                            data: {
                                message: `Recipient not found`,
                            },
                        });
                    }
                    if (err.message.includes("Invalid `PostLike.create()`")) {
                        return res.status(404).json({
                            status: "fail",
                            data: {
                                message: `Post not found`,
                            },
                        });
                    }
                }
                case "P2025": {
                    if (err.message.includes("const createdFollow")) {
                        return res.status(404).json({
                            status: "fail",
                            data: {
                                message: `User not found`,
                            },
                        });
                    }
                    else if (err.message.includes("Foreign key constraint failed on the field: `postId`")) {
                        return res.status(404).json({
                            status: "fail",
                            data: {
                                message: "Can't found post with provided postId",
                            },
                        });
                    }
                    else if (err.message.includes("Foreign key constraint failed on the field: `parentId`")) {
                        return res.status(404).json({
                            status: "fail",
                            data: {
                                message: "Can't found comment with provided parentId",
                            },
                        });
                    }
                    // return res.status(404).json({
                    //   status: "fail",
                    //   data: {
                    //     message: "Record to delete does not exist.",
                    //   },
                    // });
                }
            }
        }
        case "PrismaClientValidationError": {
            if (err.message.includes("Argument `id` is missing") ||
                err.message.includes("Unable to fit value 1e+23 into a 64-bit signed integer for field `id`") ||
                (err.message.includes("needs at least one of `id` arguments.") &&
                    err.message.includes("Argument `where`"))) {
                return res.status(422).json({
                    status: "fail",
                    data: {
                        message: "Invalid provided id, expected Int number or numeric string, received NaN value",
                    },
                });
            }
            return res.status(422).json({
                status: "fail",
                data: {
                    message: (_a = err.message
                        .slice(err.message.indexOf("`content`:"))
                        .split("`content`: ")[1]) !== null && _a !== void 0 ? _a : "Invalid value provided. Validation Error!",
                },
            });
        }
        case "ZodError": {
            return res.status(422).json({
                status: "fail",
                data: {
                    errors: err.issues,
                    name: err.name,
                },
            });
        }
        default: {
            if ((err === null || err === void 0 ? void 0 : err.statusCode) >= 500)
                return res.status((_b = err === null || err === void 0 ? void 0 : err.statusCode) !== null && _b !== void 0 ? _b : 500).json({
                    status: "error",
                    message: (_c = err.message) !== null && _c !== void 0 ? _c : "Something went wrong!",
                });
            return res.status((_d = err === null || err === void 0 ? void 0 : err.statusCode) !== null && _d !== void 0 ? _d : 500).json({
                status: "fail",
                data: {
                    message: err.message,
                },
            });
        }
    }
});
exports.error = error;

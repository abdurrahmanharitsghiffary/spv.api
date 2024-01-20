"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordLimiter = exports.verifyLimiter = exports.registerLimiter = exports.commentLimiter = exports.apiLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const response_1 = require("../utils/response");
const apiLimitOptions = {
    max: 5000,
    windowMs: 60000 * 5,
    message: new response_1.ApiError(429, "Rate limit exceeded, please try again after 5 minutes."),
    standardHeaders: "draft-7",
    legacyHeaders: false,
};
const commentLimiterOptions = {
    max: 5000,
    windowMs: 60000 * 10,
    message: new response_1.ApiError(429, "Rate limit exceeded, please try again after 10 minutes"),
    standardHeaders: "draft-7",
    legacyHeaders: true,
};
const loginLimitOptions = {
    max: 5,
    legacyHeaders: false,
    standardHeaders: "draft-7",
    windowMs: 60000 * 60,
    message: new response_1.ApiError(429, "Too many unsuccessfull login attempt, please try again after 1 hour"),
    skipSuccessfulRequests: true,
};
const registerLimitOptions = {
    max: 5,
    windowMs: 60000 * 60,
    message: new response_1.ApiError(429, "Too many account created from this IP, please try again after one hour"),
    skipFailedRequests: true,
    legacyHeaders: false,
    standardHeaders: "draft-7",
};
const passwordResetLimitOptions = {
    max: 5,
    windowMs: 60000 * 10,
    message: new response_1.ApiError(429, "Too many request for reset password token from this IP, please try again after 10 minutes"),
    skipFailedRequests: true,
    legacyHeaders: false,
    standardHeaders: "draft-7",
};
const verifyResetLimitOptions = {
    max: 10,
    windowMs: 60000 * 10,
    message: new response_1.ApiError(429, "Too many request for verify token from this IP, please try again after 10 minutes"),
    skipFailedRequests: true,
    legacyHeaders: false,
    standardHeaders: "draft-7",
};
exports.loginLimiter = (0, express_rate_limit_1.rateLimit)(loginLimitOptions);
exports.apiLimiter = (0, express_rate_limit_1.rateLimit)(apiLimitOptions);
exports.commentLimiter = (0, express_rate_limit_1.rateLimit)(commentLimiterOptions);
exports.registerLimiter = (0, express_rate_limit_1.rateLimit)(registerLimitOptions);
exports.verifyLimiter = (0, express_rate_limit_1.rateLimit)(verifyResetLimitOptions);
exports.resetPasswordLimiter = (0, express_rate_limit_1.rateLimit)(passwordResetLimitOptions);

import { Options, rateLimit } from "express-rate-limit";

const apiLimitOptions: Partial<Options> = {
  max: 5000,
  windowMs: 60000 * 5,
  message: {
    status: "error",
    message: "Rate limit exceeded, please try again after 5 minutes",
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
};

const commentLimiterOptions: Partial<Options> = {
  max: 5000,
  windowMs: 60000 * 10,
  message: {
    status: "error",
    message: "Rate limit exceeded, please try again after 10 minutes",
  },
  standardHeaders: "draft-7",
  legacyHeaders: true,
};

const loginLimitOptions: Partial<Options> = {
  max: 5,
  legacyHeaders: false,
  standardHeaders: "draft-7",
  windowMs: 60000 * 60,
  message: {
    status: "error",
    message:
      "Too many unsuccessfull login attempt, please try again after 1 hour",
  },
  skipSuccessfulRequests: true,
};

const registerLimitOptions: Partial<Options> = {
  max: 5,
  windowMs: 60000 * 60,
  message: {
    status: "error",
    message:
      "Too many account created from this IP, please try again after one hour",
  },
  skipFailedRequests: true,
  legacyHeaders: false,
  standardHeaders: "draft-7",
};

const passwordResetLimitOptions: Partial<Options> = {
  max: 5,
  windowMs: 60000 * 10,
  message: {
    status: "error",
    message:
      "Too many request for reset password token from this IP, please try again after 10 minutes",
  },
  skipFailedRequests: true,
  legacyHeaders: false,
  standardHeaders: "draft-7",
};

const verifyResetLimitOptions: Partial<Options> = {
  max: 10,
  windowMs: 60000 * 10,
  message: {
    status: "error",
    message:
      "Too many request for verify token from this IP, please try again after 10 minutes",
  },
  skipFailedRequests: true,
  legacyHeaders: false,
  standardHeaders: "draft-7",
};

export const loginLimiter = rateLimit(loginLimitOptions);
export const apiLimiter = rateLimit(apiLimitOptions);
export const commentLimiter = rateLimit(commentLimiterOptions);
export const registerLimiter = rateLimit(registerLimitOptions);
export const verifyLimiter = rateLimit(verifyResetLimitOptions);
export const resetPasswordLimiter = rateLimit(passwordResetLimitOptions);

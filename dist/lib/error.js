"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnauthorizedError = exports.RequestError = void 0;
class RequestError extends Error {
    constructor(message, statusCode, errors = [], code) {
        super();
        this.message = message;
        this.statusCode = statusCode;
        this.name = "RequestError";
        if (code)
            this.code = code;
        if ((errors === null || errors === void 0 ? void 0 : errors.length) > 0)
            this.errors = errors;
    }
}
exports.RequestError = RequestError;
class UnauthorizedError extends Error {
    constructor() {
        super();
        this.statusCode = 401;
        this.message = "Unauthorized";
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends Error {
    constructor() {
        super();
        this.statusCode = 403;
        this.message = "Access Denied";
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;

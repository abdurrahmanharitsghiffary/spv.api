"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ApiResponse = void 0;
class ApiResponse {
    constructor(data, statusCode, message) {
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
        this.statusCode = statusCode;
    }
}
exports.ApiResponse = ApiResponse;
class ApiError {
    constructor(statusCode, message, errors, name) {
        this.message = message;
        this.data = null;
        this.statusCode = statusCode;
        this.success = statusCode < 400;
        if ((errors !== null && errors !== void 0 ? errors : []).length > 0) {
            this.errors = errors;
        }
        if (name && name !== "RequestError") {
            this.name = name;
        }
    }
}
exports.ApiError = ApiError;

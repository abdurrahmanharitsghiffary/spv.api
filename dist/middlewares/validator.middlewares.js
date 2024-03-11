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
exports.validatePagingOptionsExtend = exports.validatePagingOptions = exports.validateParamsV2 = exports.validateParams = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
const schema_1 = require("../schema");
const validate = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    }
    catch (error) {
        next(error);
    }
});
exports.validate = validate;
const validateBody = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield zod_1.z.object({ body: schema }).parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateBody = validateBody;
const validateParams = (schema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield zod_1.z.object({ params: schema }).parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateParams = validateParams;
const validateParamsV2 = (key) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield zod_1.z
            .object({
            params: zod_1.z.object({
                [key]: schema_1.zIntOrStringId,
            }),
        })
            .parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateParamsV2 = validateParamsV2;
exports.validatePagingOptions = (0, exports.validate)(zod_1.z.object({
    query: zod_1.z.object({
        limit: schema_1.zLimit,
        offset: schema_1.zOffset,
    }),
}));
const validatePagingOptionsExtend = (object) => {
    let schema = zod_1.z.object({
        query: zod_1.z.object({
            limit: schema_1.zLimit,
            offset: schema_1.zOffset,
        }),
    });
    if (object) {
        schema.extend(object);
    }
    return (0, exports.validate)(schema);
};
exports.validatePagingOptionsExtend = validatePagingOptionsExtend;

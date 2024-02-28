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
exports.getPagingObject = exports.getCurrentUrl = void 0;
const consts_1 = require("../lib/consts");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const getCurrentUrl = (req) => new URL(req.originalUrl, consts_1.BASE_URL).href;
exports.getCurrentUrl = getCurrentUrl;
const getPrevUrl = ({ offset, limit, path, }) => {
    const url = new URL(path, consts_1.BASE_URL);
    if (offset - limit < 0) {
        if (offset === 0) {
            return null;
        }
        else {
            offset = 0;
        }
    }
    else {
        offset = offset - limit;
    }
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("offset", offset.toString());
    return url.href;
};
const getNextUrl = ({ offset, limit, path, }) => {
    const url = new URL(path, consts_1.BASE_URL);
    url.searchParams.set("offset", (offset + limit).toString());
    url.searchParams.set("limit", limit.toString());
    return url.href;
};
const getPagingObject = ({ req, data, total_records, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    let { limit = 20, offset = 0 } = req.query;
    offset = Number(offset);
    limit = Number(limit);
    yield zod_1.z
        .object({
        query: zod_1.z.object({
            limit: schema_1.zLimit,
            offset: schema_1.zOffset,
        }),
    })
        .parseAsync({
        query: req.query,
    });
    const path = (0, exports.getCurrentUrl)(req);
    const dataLength = (data !== null && data !== void 0 ? data : []) instanceof Array
        ? (_a = data === null || data === void 0 ? void 0 : data.length) !== null && _a !== void 0 ? _a : 0
        : ((_d = (_c = (_b = data === null || data === void 0 ? void 0 : data.posts) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) +
            ((_g = (_f = (_e = data === null || data === void 0 ? void 0 : data.users) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.length) !== null && _g !== void 0 ? _g : 0);
    return {
        statusCode: 200,
        success: true,
        data,
        pagination: {
            next: total_records <= limit ||
                offset >= total_records - limit ||
                dataLength < limit
                ? null
                : getNextUrl({ path, limit, offset }),
            previous: getPrevUrl({ path, limit, offset }),
            current: path,
            resultCount: dataLength,
            totalRecords: total_records,
            offset,
            limit,
        },
    };
});
exports.getPagingObject = getPagingObject;

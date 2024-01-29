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
exports.unblockUser = exports.blockUserById = exports.getAllBlockedUsers = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const response_1 = require("../utils/response");
const error_1 = require("../lib/error");
const user_utils_1 = require("../utils/user/user.utils");
const user_1 = require("../lib/query/user");
const paging_1 = require("../utils/paging");
const user_normalize_1 = require("../utils/user/user.normalize");
const messages_1 = require("../lib/messages");
const getAllBlockedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req;
    let { limit = 20, offset = 0 } = req.query;
    const uId = Number(userId);
    limit = Number(limit);
    offset = Number(offset);
    const user = yield user_models_1.default.findUnique({
        where: {
            id: uId,
        },
        select: Object.assign(Object.assign({}, user_1.selectUser), { blocked: {
                select: user_1.selectUserPublic,
                take: limit,
                skip: offset,
                orderBy: [{ username: "asc" }, { firstName: "asc" }],
            }, _count: {
                select: Object.assign(Object.assign({}, user_1.selectUserPublic._count.select), { blocked: true }),
            } }),
    });
    res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: yield Promise.all(((_a = user === null || user === void 0 ? void 0 : user.blocked) !== null && _a !== void 0 ? _a : []).map((user) => {
            return Promise.resolve((0, user_normalize_1.normalizeUserPublic)(user));
        })),
        req,
        total_records: (_b = user === null || user === void 0 ? void 0 : user._count.blocked) !== null && _b !== void 0 ? _b : 0,
    }));
});
exports.getAllBlockedUsers = getAllBlockedUsers;
const blockUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: currentUserId } = req;
    const { userId } = req.body;
    const uId = Number(userId);
    const CUID = Number(currentUserId);
    if (uId === CUID)
        throw new error_1.RequestError("Cannot block yourself.", 400);
    yield (0, user_utils_1.findUserById)(uId, CUID);
    const result = yield user_models_1.default.update({
        where: {
            id: CUID,
        },
        data: {
            blocked: {
                connect: {
                    id: uId,
                },
            },
        },
        select: {
            id: true,
            username: true,
        },
    });
    return res.status(201).json(new response_1.ApiResponse(result, 201));
});
exports.blockUserById = blockUserById;
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { userId: currentUserId } = req;
    const { userId } = req.params;
    const CUID = Number(currentUserId);
    const uId = Number(userId);
    const user = yield user_models_1.default.findUnique({
        where: {
            id: uId,
        },
        select: {
            blocking: {
                select: { id: true },
                where: {
                    id: CUID,
                },
            },
        },
    });
    if (!user)
        throw new error_1.RequestError(messages_1.NotFound.USER, 404);
    const isUserBlockedByUs = ((_d = (_c = user === null || user === void 0 ? void 0 : user.blocking) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id) ? true : false;
    if (!isUserBlockedByUs)
        throw new error_1.RequestError("User is not blocked.", 400);
    yield user_models_1.default.update({
        where: {
            id: CUID,
        },
        data: {
            blocked: {
                disconnect: {
                    id: uId,
                },
            },
        },
    });
    return res.status(204).json(new response_1.ApiResponse(null, 204));
});
exports.unblockUser = unblockUser;

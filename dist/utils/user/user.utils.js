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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsUserFound = exports.searchUsersByName = exports.findFollowUserByUserId = exports.findAllUser = exports.findUserById = exports.findUserPublic = exports.userWhereAndInput = void 0;
const user_models_1 = __importDefault(require("../../models/user.models"));
const user_normalize_1 = require("./user.normalize");
const error_1 = require("../../lib/error");
const user_1 = require("../../lib/query/user");
const messages_1 = require("../../lib/messages");
const userWhereAndInput = (currentUserId) => currentUserId
    ? ([
        Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
    ])
    : undefined;
exports.userWhereAndInput = userWhereAndInput;
const findUserPublic = (id, currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.default.findUnique({
        where: {
            id: Number(id),
            AND: (0, exports.userWhereAndInput)(currentUserId),
        },
        select: user_1.selectUserPublic,
    });
    if (!user)
        throw new error_1.RequestError(messages_1.NotFound.USER, 404);
    const normalizedUser = yield (0, user_normalize_1.normalizeUserPublic)(user);
    return normalizedUser;
});
exports.findUserPublic = findUserPublic;
const findUserById = (id, currentUserId, customMessage = {
    message: messages_1.NotFound.USER,
    statusCode: 404,
}) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.default.findUnique({
        where: {
            AND: (0, exports.userWhereAndInput)(currentUserId),
            id,
        },
        select: user_1.selectUser,
    });
    if (!user)
        throw new error_1.RequestError(customMessage.message, customMessage.statusCode);
    const normalizedUser = yield (0, user_normalize_1.normalizeUser)(user);
    return normalizedUser;
});
exports.findUserById = findUserById;
const findAllUser = ({ limit, offset, userId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_models_1.default.findMany({
        select: Object.assign({}, user_1.selectUser),
        take: limit,
        skip: offset,
        where: {
            AND: (0, exports.userWhereAndInput)(userId),
        },
    });
    const totalUsers = yield user_models_1.default.count({
        where: {
            AND: (0, exports.userWhereAndInput)(userId),
        },
    });
    const normalizedUser = yield Promise.all(users.map((user) => {
        return Promise.resolve((0, user_normalize_1.normalizeUser)(user));
    }));
    return { data: normalizedUser, total: totalUsers };
});
exports.findAllUser = findAllUser;
const findFollowUserByUserId = ({ types, userId, currentUserId, limit = 20, offset = 0, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const user = yield user_models_1.default.findUnique({
        where: {
            id: Number(userId),
            AND: (0, exports.userWhereAndInput)(currentUserId),
        },
        select: {
            [types]: {
                where: {
                    AND: (0, exports.userWhereAndInput)(currentUserId),
                },
                select: Object.assign({}, user_1.selectUserSimplified),
                skip: offset,
                take: limit,
                orderBy: {
                    fullName: "asc",
                },
            },
            _count: {
                select: {
                    [types]: true,
                },
            },
        },
    });
    if (!user)
        throw new error_1.RequestError(messages_1.NotFound.USER, 404);
    return {
        data: [
            ...((_b = (_a = user === null || user === void 0 ? void 0 : user[types]) === null || _a === void 0 ? void 0 : _a.map((_a) => {
                var { profile } = _a, rest = __rest(_a, ["profile"]);
                return (Object.assign(Object.assign({}, rest), { avatarImage: profile === null || profile === void 0 ? void 0 : profile.avatarImage }));
            })) !== null && _b !== void 0 ? _b : []),
        ],
        total: (_d = (_c = user === null || user === void 0 ? void 0 : user._count) === null || _c === void 0 ? void 0 : _c[types]) !== null && _d !== void 0 ? _d : 0,
    };
});
exports.findFollowUserByUserId = findFollowUserByUserId;
const searchUsersByName = ({ limit = 20, offset = 0, query, currentUserId, filter, }) => __awaiter(void 0, void 0, void 0, function* () {
    const cuId = currentUserId || currentUserId === 0 ? currentUserId : undefined;
    let filterQuery = [
        {
            followedBy: filter === "not_followed"
                ? {
                    every: {
                        id: {
                            not: cuId,
                        },
                    },
                }
                : filter === "followed"
                    ? {
                        every: {
                            id: {
                                equals: cuId,
                            },
                        },
                    }
                    : undefined,
        },
    ];
    const andInput = (0, exports.userWhereAndInput)(currentUserId);
    const users = yield user_models_1.default.findMany({
        where: {
            OR: [
                {
                    fullName: {
                        contains: query,
                    },
                },
                {
                    username: {
                        contains: query,
                    },
                },
            ],
            AND: [
                ...(andInput !== null && andInput !== void 0 ? andInput : []),
                ...filterQuery,
                {
                    id: {
                        not: cuId,
                    },
                },
            ],
        },
        orderBy: {
            fullName: "asc",
        },
        take: limit,
        skip: offset,
        select: user_1.selectUserPublic,
    });
    const total = yield user_models_1.default.count({
        where: {
            OR: [
                {
                    fullName: {
                        contains: query,
                    },
                },
                {
                    username: {
                        contains: query,
                    },
                },
            ],
            AND: [
                ...(andInput !== null && andInput !== void 0 ? andInput : []),
                ...filterQuery,
                {
                    id: {
                        not: cuId,
                    },
                },
            ],
        },
    });
    const normalizedUsers = yield Promise.all(users.map((user) => Promise.resolve((0, user_normalize_1.normalizeUserPublic)(user))));
    return { data: normalizedUsers, total };
});
exports.searchUsersByName = searchUsersByName;
const checkIsUserFound = ({ userId, currentUserId, select, }) => __awaiter(void 0, void 0, void 0, function* () {
    const andInput = currentUserId ? (0, exports.userWhereAndInput)(currentUserId) : undefined;
    const user = yield user_models_1.default.findUnique({
        where: {
            id: userId,
            AND: andInput,
        },
        select: Object.assign({ id: true }, select),
    });
    if (!user)
        throw new error_1.RequestError(messages_1.NotFound.USER, 404);
    return user;
});
exports.checkIsUserFound = checkIsUserFound;

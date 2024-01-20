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
exports.unfollowUser = exports.followUser = exports.getFollowedUsersById = exports.getUserFollowersById = exports.getMyFollowers = exports.getFollowedUser = void 0;
const user_utils_1 = require("../utils/user/user.utils");
const user_models_1 = __importDefault(require("../models/user.models"));
const error_1 = require("../lib/error");
const response_1 = require("../utils/response");
const user_1 = require("../lib/query/user");
const messages_1 = require("../lib/messages");
const paging_1 = require("../utils/paging");
const notification_utils_1 = require("../utils/notification/notification.utils");
const getFollowedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { limit, offset } = (0, paging_1.parsePaging)(req);
    const followedUsers = yield (0, user_utils_1.findFollowUserByUserId)({
        types: "following",
        userId,
        limit,
        offset,
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        total_records: followedUsers.total,
        data: followedUsers.data,
    }));
});
exports.getFollowedUser = getFollowedUser;
const getMyFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req;
    const { limit, offset } = (0, paging_1.parsePaging)(req);
    const followers = yield (0, user_utils_1.findFollowUserByUserId)({
        types: "followedBy",
        userId,
        limit,
        offset,
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        data: followers.data,
        total_records: followers.total,
    }));
});
exports.getMyFollowers = getMyFollowers;
const getUserFollowersById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: currentUserId } = req;
    let { limit = 20, offset = 0 } = req.query;
    limit = Number(limit);
    offset = Number(offset);
    const { userId } = req.params;
    const userFollowers = yield (0, user_utils_1.findFollowUserByUserId)({
        userId,
        types: "followedBy",
        currentUserId: Number(currentUserId),
        limit,
        offset,
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        total_records: userFollowers.total,
        data: userFollowers.data,
    }));
});
exports.getUserFollowersById = getUserFollowersById;
const getFollowedUsersById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: currentUserId } = req;
    let { limit = 20, offset = 0 } = req.query;
    limit = Number(limit);
    offset = Number(offset);
    const { userId } = req.params;
    const userFollowers = yield (0, user_utils_1.findFollowUserByUserId)({
        userId,
        types: "following",
        currentUserId: Number(currentUserId),
        limit,
        offset,
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        req,
        total_records: userFollowers.total,
        data: userFollowers.data,
    }));
});
exports.getFollowedUsersById = getFollowedUsersById;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId: currentUserId } = req;
    const { userId } = req.body;
    const CUID = Number(currentUserId);
    const uId = Number(userId);
    if (CUID === uId)
        throw new error_1.RequestError("Can't follow yourself", 400);
    yield (0, user_utils_1.findUserPublic)(uId, CUID);
    const user = yield user_models_1.default.findUnique({
        where: {
            id: CUID,
        },
        select: {
            following: {
                select: { id: true },
                where: {
                    id: uId,
                },
            },
        },
    });
    const userAlreadyFollowed = ((_b = (_a = user === null || user === void 0 ? void 0 : user.following) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) ? true : false;
    if (userAlreadyFollowed) {
        throw new error_1.RequestError("User already followed.", 409);
    }
    const createdFollow = yield user_models_1.default.update({
        where: {
            id: CUID,
        },
        data: {
            following: {
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
    yield (0, notification_utils_1.notify)(req, { type: "follow", receiverId: uId, userId: CUID });
    return res
        .status(201)
        .json(new response_1.ApiResponse(createdFollow, 201, "User successfully followed."));
});
exports.followUser = followUser;
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { userId } = req;
    const { followId } = req.params;
    const fId = Number(followId);
    const cId = Number(userId);
    const user = yield user_models_1.default.findUnique({
        where: {
            id: fId,
            AND: [
                Object.assign(Object.assign({}, (0, user_1.excludeBlockingUser)(cId)), (0, user_1.excludeBlockedUser)(cId)),
            ],
        },
        select: {
            followedBy: {
                select: { id: true },
                where: { id: cId },
            },
        },
    });
    if (!user)
        throw new error_1.RequestError(messages_1.NotFound.USER, 404);
    const isUserAlreadyFollowed = ((_d = (_c = user === null || user === void 0 ? void 0 : user.followedBy) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id) ? true : false;
    if (!isUserAlreadyFollowed)
        throw new error_1.RequestError("User is not followed", 400);
    yield user_models_1.default.update({
        where: {
            id: Number(userId),
        },
        data: {
            following: {
                disconnect: {
                    id: fId,
                },
            },
        },
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "Successfully unfollow user."));
});
exports.unfollowUser = unfollowUser;

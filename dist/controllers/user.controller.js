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
exports.getUserIsFollowed = exports.getPostByUserId = exports.updateUser = exports.deleteUser = exports.getAllUsers = exports.getUser = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const profile_models_1 = __importDefault(require("../models/profile.models"));
const user_utils_1 = require("../utils/user/user.utils");
const paging_1 = require("../utils/paging");
const response_1 = require("../utils/response");
const post_utils_1 = require("../utils/post/post.utils");
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: currentUserId } = req;
    const { userId } = req.params;
    const user = yield (0, user_utils_1.findUserPublic)(userId, Number(currentUserId));
    return res.status(200).json(new response_1.ApiResponse(user, 200));
});
exports.getUser = getUser;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { limit = 20, offset = 0 } = req.query;
    limit = Number(limit);
    offset = Number(offset);
    const users = yield (0, user_utils_1.findAllUser)({ limit, offset });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: users.data,
        total_records: users.total,
        req,
    }));
});
exports.getAllUsers = getAllUsers;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    yield (0, user_utils_1.findUserById)(Number(userId));
    yield user_models_1.default.delete({ where: { id: Number(userId) } });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "User successfully deleted."));
});
exports.deleteUser = deleteUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { username, description } = req.body;
    yield (0, user_utils_1.findUserById)(Number(userId));
    const user = yield user_models_1.default.update({
        where: {
            id: Number(userId),
        },
        data: {
            username,
        },
    });
    yield profile_models_1.default.upsert({
        where: {
            userId: user.email,
        },
        update: {
            profileDescription: description,
        },
        create: {
            userId: user.email,
        },
    });
    return res
        .status(204)
        .json(new response_1.ApiResponse(null, 204, "User successfully updated."));
});
exports.updateUser = updateUser;
const getPostByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: currentUserId } = req;
    let { offset = 0, limit = 20 } = req.query;
    const { userId } = req.params;
    offset = Number(offset);
    limit = Number(limit);
    const posts = yield (0, post_utils_1.findPostsByAuthorId)({
        authorId: Number(userId),
        limit,
        offset,
        currentUserId: Number(currentUserId),
    });
    return res.status(200).json(yield (0, paging_1.getPagingObject)({
        data: posts.data,
        total_records: posts.total,
        req,
    }));
});
exports.getPostByUserId = getPostByUserId;
const getUserIsFollowed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: uId } = req.params;
    const { userId } = req;
    const isFollowed = yield user_models_1.default.findUnique({
        where: {
            id: Number(uId),
            followedBy: {
                some: {
                    id: Number(userId),
                },
            },
        },
    });
    return res.status(200).json(new response_1.ApiResponse(isFollowed ? true : false, 200));
});
exports.getUserIsFollowed = getUserIsFollowed;

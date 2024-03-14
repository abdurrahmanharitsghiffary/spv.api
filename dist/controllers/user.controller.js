"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.createUser = exports.getUserIsFollowed = exports.getPostByUserId = exports.updateUser = exports.deleteUser = exports.getAllUsers = exports.getUser = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const profile_models_1 = __importDefault(require("../models/profile.models"));
const user_utils_1 = require("../utils/user/user.utils");
const paging_1 = require("../utils/paging");
const response_1 = require("../utils/response");
const post_utils_1 = require("../utils/post/post.utils");
const utils_1 = require("../utils");
const bcrypt_1 = require("bcrypt");
const consts_1 = require("../lib/consts");
const error_1 = require("../lib/error");
const user_normalize_1 = require("../utils/user/user.normalize");
const user_1 = require("../lib/query/user");
const image_models_1 = __importStar(require("../models/image.models"));
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
    var _a, _b, _c, _d;
    const { uploadedImageUrls } = req;
    const profileImageSrc = (0, utils_1.getCloudinaryFileSrc)(uploadedImageUrls, "profile");
    const coverImageSrc = (0, utils_1.getCloudinaryFileSrc)(uploadedImageUrls, "cover");
    const { userId } = req.params;
    const { username, description, role, firstName, lastName, gender, birthDate, } = req.body;
    yield (0, user_utils_1.findUserById)(Number(userId));
    const user = yield user_models_1.default.update({
        where: {
            id: Number(userId),
        },
        data: {
            role,
            firstName,
            lastName,
            fullName: (0, utils_1.getFullName)(firstName, lastName),
            username,
        },
        include: { profile: { select: { id: true } } },
    });
    if (!user)
        throw new error_1.RequestError("Something went wrong!", 400);
    yield profile_models_1.default.upsert({
        where: {
            userId: user.email,
        },
        update: {
            gender,
            birthDate,
            profileDescription: description,
        },
        create: {
            userId: user.email,
            profileDescription: description,
            gender,
            birthDate,
        },
    });
    if (coverImageSrc) {
        yield image_models_1.CoverImage.upsert({
            create: { profileId: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.id, src: coverImageSrc },
            update: { src: coverImageSrc },
            where: { profileId: (_b = user.profile) === null || _b === void 0 ? void 0 : _b.id },
        });
    }
    if (profileImageSrc) {
        yield image_models_1.default.upsert({
            create: { profileId: (_c = user.profile) === null || _c === void 0 ? void 0 : _c.id, src: profileImageSrc },
            update: { src: profileImageSrc },
            where: { profileId: (_d = user.profile) === null || _d === void 0 ? void 0 : _d.id },
        });
    }
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
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uploadedImageUrls } = req;
    const coverImageSrc = (0, utils_1.getCloudinaryFileSrc)(uploadedImageUrls, "cover");
    const profileImageSrc = (0, utils_1.getCloudinaryFileSrc)(uploadedImageUrls, "profile");
    const { email, firstName, lastName, username, password, confirmPassword, role = "user", gender, birthDate, } = req.body;
    if (password !== confirmPassword)
        throw new error_1.RequestError(consts_1.errorsMessage.FAILED_CONFIRMATION_MESSAGE, 401);
    const hashedPassword = yield (0, bcrypt_1.hash)(password, Number(consts_1.BCRYPT_SALT));
    const createdUser = yield user_models_1.default.create({
        data: {
            email,
            firstName,
            lastName,
            username,
            fullName: (0, utils_1.getFullName)(firstName, lastName),
            hashedPassword,
            role,
            profile: {
                create: {
                    gender,
                    birthDate,
                    avatarImage: profileImageSrc
                        ? { create: { src: profileImageSrc } }
                        : undefined,
                    coverImage: coverImageSrc
                        ? { create: { src: coverImageSrc } }
                        : undefined,
                },
            },
        },
        select: user_1.selectUser,
    });
    const normalizedUser = yield (0, user_normalize_1.normalizeUser)(createdUser);
    return res.status(201).json(new response_1.ApiResponse(normalizedUser, 201));
});
exports.createUser = createUser;

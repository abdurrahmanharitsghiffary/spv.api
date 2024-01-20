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
exports.prismaImageUploader = exports.imageUploadErrorHandler = exports.checkParticipants = exports.isNullOrUndefined = exports.getRandomToken = exports.getCompleteFileUrlPath = exports.getFileDest = exports.generateAccessToken = exports.generateRefreshToken = exports.deleteUploadedImage = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const consts_1 = require("../lib/consts");
const chat_models_1 = require("../models/chat.models");
const user_models_1 = __importDefault(require("../models/user.models"));
const code_1 = require("../lib/code");
const error_1 = require("../lib/error");
const messages_1 = require("../lib/messages");
const deleteUploadedImage = (src) => __awaiter(void 0, void 0, void 0, function* () {
    if (src.includes("giphy"))
        return null;
    const path = src.split("public/")[1];
    try {
        yield promises_1.default.unlink("src/public/" + path);
    }
    catch (err) {
        throw new Error(err);
    }
});
exports.deleteUploadedImage = deleteUploadedImage;
const generateRefreshToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield jsonwebtoken_1.default.sign(payload, consts_1.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
});
exports.generateRefreshToken = generateRefreshToken;
const generateAccessToken = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield jsonwebtoken_1.default.sign(payload, consts_1.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600,
        // expiresIn: 1,
    });
});
exports.generateAccessToken = generateAccessToken;
const getFileDest = (file) => {
    if (!file)
        return null;
    return (file === null || file === void 0 ? void 0 : file.destination.replace("src", "")) + `/${file === null || file === void 0 ? void 0 : file.filename}`;
};
exports.getFileDest = getFileDest;
const getCompleteFileUrlPath = (profile) => {
    if (!profile)
        return null;
    try {
        const url = new URL(profile.src, consts_1.BASE_URL);
        return Object.assign(Object.assign({}, profile), { src: url.href });
    }
    catch (err) {
        return null;
    }
};
exports.getCompleteFileUrlPath = getCompleteFileUrlPath;
const getRandomToken = () => {
    return new Promise((resolve) => resolve(crypto_1.default.randomBytes(32).toString("hex")));
};
exports.getRandomToken = getRandomToken;
const isNullOrUndefined = (data) => {
    return data === null || data === undefined;
};
exports.isNullOrUndefined = isNullOrUndefined;
const checkParticipants = (participants, groupId, currentUserRole, isDeleting = false) => __awaiter(void 0, void 0, void 0, function* () {
    const chatRoom = chat_models_1.ChatRoom.findUnique({
        where: {
            id: groupId,
        },
    });
    if (!chatRoom)
        throw new error_1.RequestError(messages_1.NotFound.GROUP_CHAT, 404);
    const errors = [];
    yield Promise.all(participants.map((item, i) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = isDeleting ? item : item.id;
        const participantRole = (_a = item === null || item === void 0 ? void 0 : item.role) !== null && _a !== void 0 ? _a : null;
        const user = yield user_models_1.default.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            const participant = yield chat_models_1.ChatRoomParticipant.findUnique({
                where: {
                    chatRoomId_userId: {
                        chatRoomId: groupId,
                        userId: id,
                    },
                },
            });
            // Check if user is participated in the group before removing them
            if (isDeleting && !participant && user) {
                errors.push({
                    message: `Can't found participant with ID ${id} in the group.`,
                    groupId,
                    code: code_1.Code.NOT_FOUND,
                    id,
                });
                return;
            }
            const IS_ADMIN_PROMOTE_USER = (participant === null || participant === void 0 ? void 0 : participant.role) === "user" &&
                participantRole === "admin" &&
                currentUserRole === "admin";
            const IS_ADMIN_DEMOTING_ADMIN = (participant === null || participant === void 0 ? void 0 : participant.role) === "admin" &&
                participantRole === "user" &&
                currentUserRole === "admin";
            const IS_ADMIN_UPDATE_CREATOR = (participant === null || participant === void 0 ? void 0 : participant.role) === "creator" && currentUserRole === "admin";
            const IS_UPDATING_USER_WITH_ROLE_ADMIN = (participant === null || participant === void 0 ? void 0 : participant.role) === "admin" && currentUserRole === "admin";
            const IS_USER_ALREADY_EXIST = participant && (participant === null || participant === void 0 ? void 0 : participant.role) === participantRole;
            // Check if user already exist in the group before add them
            // if user is already exist with role user and the item.role is "admin" that user will be promoted as admin in the group
            if (participant && IS_ADMIN_UPDATE_CREATOR) {
                errors.push({
                    message: `Admin cannot ${isDeleting ? "delete" : "demote"} group creator`,
                    code: code_1.Code.FORBIDDEN,
                    groupId,
                    id,
                });
                return;
            }
            if (IS_USER_ALREADY_EXIST && !isDeleting) {
                errors.push({
                    message: `Participant with ID ${id} already exists in the group.`,
                    groupId,
                    code: code_1.Code.DUPLICATE,
                    id,
                });
                return;
            }
            // Check if current user "admin" role is deleting or demoting another "admin"
            // if yes it will add error because admin can't demote or delete another admin
            if (participant && IS_UPDATING_USER_WITH_ROLE_ADMIN && isDeleting
                ? true
                : IS_ADMIN_DEMOTING_ADMIN && !IS_ADMIN_PROMOTE_USER) {
                errors.push({
                    message: isDeleting
                        ? "Can't delete user with role admin with current role (admin)"
                        : "Can't demote admin to user with current role (admin)",
                    code: code_1.Code.FORBIDDEN,
                    id,
                    groupId,
                });
                return;
            }
        }
        else {
            errors.push({
                message: messages_1.NotFound.USER,
                code: code_1.Code.NOT_FOUND,
                id,
            });
        }
    })));
    // Should we edit the code to make an admin can demote another admin? for now, nahh
    if (errors.length > 0)
        throw new error_1.RequestError(isDeleting
            ? "Failed to remove participants."
            : "Failed add participants into the group.", 400, errors);
});
exports.checkParticipants = checkParticipants;
const imageUploadErrorHandler = (imageUploader, imageSources) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uploadedBatch = yield imageUploader;
        console.log(uploadedBatch, "Uploaded Batch");
    }
    catch (err) {
        console.log("Something goes wrong.", err);
        if (imageSources instanceof Array) {
            yield Promise.all(imageSources.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, exports.deleteUploadedImage)(image.src);
            })));
        }
        else {
            yield (0, exports.deleteUploadedImage)(imageSources.src);
        }
    }
});
exports.imageUploadErrorHandler = imageUploadErrorHandler;
const prismaImageUploader = (tx, images, id, imageType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageSources = [];
        if (images instanceof Array) {
            images.forEach((image) => {
                const fileDest = (0, exports.getFileDest)(image);
                if (fileDest)
                    imageSources.push({
                        src: fileDest,
                        [imageType + "Id"]: id,
                    });
            });
        }
        else {
            const fileDest = (0, exports.getFileDest)(images);
            if (fileDest)
                imageSources.push({
                    src: fileDest,
                    [imageType + "Id"]: id,
                });
        }
        yield (0, exports.imageUploadErrorHandler)(tx.image.createMany({ data: imageSources }), imageSources);
        return imageSources;
    }
    catch (err) {
        console.error("Something went wrong when uploading images, Error: ", err);
    }
});
exports.prismaImageUploader = prismaImageUploader;

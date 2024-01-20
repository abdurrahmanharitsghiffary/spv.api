"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplifyUserWF = exports.simplifyUser = exports.normalizeUser = exports.normalizeUserPublic = void 0;
const __1 = require("..");
const getIds = (data, types) => {
    var _a, _b;
    return [...((_b = (_a = data === null || data === void 0 ? void 0 : data[types]) === null || _a === void 0 ? void 0 : _a.map((user) => user === null || user === void 0 ? void 0 : user.id)) !== null && _b !== void 0 ? _b : [])];
};
const normalizeUserPublic = (user, isFollowed) => new Promise((resolve) => {
    var _a, _b;
    const normalizedUserPublic = {
        id: user === null || user === void 0 ? void 0 : user.id,
        isFollowed,
        isOnline: user === null || user === void 0 ? void 0 : user.isOnline,
        firstName: user === null || user === void 0 ? void 0 : user.firstName,
        lastName: user === null || user === void 0 ? void 0 : user.lastName,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        username: user === null || user === void 0 ? void 0 : user.username,
        profile: user.profile
            ? {
                birthDate: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.birthDate,
                gender: (_b = user.profile) === null || _b === void 0 ? void 0 : _b.gender,
                description: user.profile.profileDescription,
                avatarImage: (0, __1.getCompleteFileUrlPath)(user.profile.avatarImage),
                coverImage: (0, __1.getCompleteFileUrlPath)(user.profile.coverImage),
            }
            : null,
        followedBy: {
            followerIds: getIds(user, "followedBy"),
            total: user._count.followedBy,
        },
        following: {
            followedUserIds: getIds(user, "following"),
            total: user._count.following,
        },
        posts: { postIds: getIds(user, "posts"), total: user._count.posts },
        updatedAt: user.updatedAt,
        createdAt: user === null || user === void 0 ? void 0 : user.createdAt,
    };
    return resolve(normalizedUserPublic);
});
exports.normalizeUserPublic = normalizeUserPublic;
const normalizeUser = (user, isFollowed) => new Promise((resolve) => {
    var _a, _b;
    const normalizedUser = {
        id: user === null || user === void 0 ? void 0 : user.id,
        isFollowed,
        isOnline: user === null || user === void 0 ? void 0 : user.isOnline,
        provider: user === null || user === void 0 ? void 0 : user.provider,
        firstName: user === null || user === void 0 ? void 0 : user.firstName,
        lastName: user === null || user === void 0 ? void 0 : user.lastName,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        username: user === null || user === void 0 ? void 0 : user.username,
        email: user === null || user === void 0 ? void 0 : user.email,
        verified: user === null || user === void 0 ? void 0 : user.verified,
        role: user === null || user === void 0 ? void 0 : user.role,
        profile: user.profile
            ? {
                birthDate: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.birthDate,
                gender: (_b = user.profile) === null || _b === void 0 ? void 0 : _b.gender,
                description: user.profile.profileDescription,
                avatarImage: (0, __1.getCompleteFileUrlPath)(user.profile.avatarImage),
                coverImage: (0, __1.getCompleteFileUrlPath)(user.profile.coverImage),
            }
            : null,
        followedBy: {
            followerIds: getIds(user, "followedBy"),
            total: user._count.followedBy,
        },
        following: {
            followedUserIds: getIds(user, "following"),
            total: user._count.following,
        },
        posts: { postIds: getIds(user, "posts"), total: user._count.posts },
        createdAt: user === null || user === void 0 ? void 0 : user.createdAt,
        updatedAt: user === null || user === void 0 ? void 0 : user.updatedAt,
    };
    // if (user.profile?.avatarImage && normalizedUser.profile) {
    //   normalizedUser.profile.image = {
    //     src: new URL(user.profile.avatarImage.src, BASE_URL).href,
    //   };
    // }
    return resolve(normalizedUser);
});
exports.normalizeUser = normalizeUser;
const simplifyUser = (user, isFollowed) => new Promise((resolve) => {
    var _a;
    return resolve({
        isFollowed,
        avatarImage: (0, __1.getCompleteFileUrlPath)((_a = user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage),
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        id: user.id,
        isOnline: user.isOnline,
        username: user.username,
    });
});
exports.simplifyUser = simplifyUser;
const simplifyUserWF = (user) => new Promise((resolve) => {
    var _a;
    return resolve({
        avatarImage: (0, __1.getCompleteFileUrlPath)((_a = user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage),
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        id: user.id,
        isOnline: user.isOnline,
        username: user.username,
    });
});
exports.simplifyUserWF = simplifyUserWF;

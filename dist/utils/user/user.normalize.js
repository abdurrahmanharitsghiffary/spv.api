"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplifyUserWF = exports.simplifyUser = exports.normalizeUser = exports.normalizeUserPublic = void 0;
const normalizeUserPublic = (user) => new Promise((resolve) => {
    var _a, _b;
    const normalizedUserPublic = {
        id: user === null || user === void 0 ? void 0 : user.id,
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
                avatarImage: user.profile.avatarImage,
                coverImage: user.profile.coverImage,
            }
            : null,
        count: user._count,
        updatedAt: user.updatedAt,
        createdAt: user === null || user === void 0 ? void 0 : user.createdAt,
    };
    return resolve(normalizedUserPublic);
});
exports.normalizeUserPublic = normalizeUserPublic;
const normalizeUser = (user) => new Promise((resolve) => {
    var _a, _b;
    const normalizedUser = {
        id: user === null || user === void 0 ? void 0 : user.id,
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
                avatarImage: user.profile.avatarImage,
                coverImage: user.profile.coverImage,
            }
            : null,
        count: user._count,
        createdAt: user === null || user === void 0 ? void 0 : user.createdAt,
        updatedAt: user === null || user === void 0 ? void 0 : user.updatedAt,
    };
    return resolve(normalizedUser);
});
exports.normalizeUser = normalizeUser;
const simplifyUser = (user) => new Promise((resolve) => {
    var _a;
    return resolve({
        avatarImage: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage,
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
        avatarImage: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.avatarImage,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user === null || user === void 0 ? void 0 : user.fullName,
        id: user.id,
        isOnline: user.isOnline,
        username: user.username,
    });
});
exports.simplifyUserWF = simplifyUserWF;

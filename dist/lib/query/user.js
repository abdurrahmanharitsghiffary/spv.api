"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectUserSimplified = exports.selectUser = exports.selectUserPublic = exports.excludeBlockingUser = exports.excludeBlockedUser = void 0;
const excludeBlockedUser = (userId) => {
    const prismaQuery = {
        blocking: {
            every: {
                id: {
                    not: userId || userId === 0 ? userId : undefined,
                },
            },
        },
    };
    return prismaQuery;
};
exports.excludeBlockedUser = excludeBlockedUser;
const excludeBlockingUser = (userId) => {
    const prismaQuery = {
        blocked: {
            every: {
                id: {
                    not: userId || userId === 0 ? userId : undefined,
                },
            },
        },
    };
    return prismaQuery;
};
exports.excludeBlockingUser = excludeBlockingUser;
exports.selectUserPublic = {
    id: true,
    firstName: true,
    lastName: true,
    fullName: true,
    isOnline: true,
    username: true,
    createdAt: true,
    profile: {
        select: {
            gender: true,
            birthDate: true,
            profileDescription: true,
            coverImage: {
                select: {
                    id: true,
                    src: true,
                },
            },
            avatarImage: {
                select: {
                    id: true,
                    src: true,
                },
            },
        },
    },
    _count: {
        select: {
            followedBy: true,
            following: true,
            posts: true,
        },
    },
    updatedAt: true,
};
exports.selectUser = {
    id: true,
    provider: true,
    verified: true,
    isOnline: true,
    firstName: true,
    lastName: true,
    fullName: true,
    username: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
    profile: {
        select: {
            gender: true,
            birthDate: true,
            profileDescription: true,
            coverImage: {
                select: {
                    id: true,
                    src: true,
                },
            },
            avatarImage: {
                select: {
                    id: true,
                    src: true,
                },
            },
        },
    },
    _count: {
        select: {
            followedBy: true,
            following: true,
            posts: true,
        },
    },
};
exports.selectUserSimplified = {
    id: true,
    firstName: true,
    lastName: true,
    fullName: true,
    isOnline: true,
    username: true,
    profile: {
        select: {
            avatarImage: {
                select: {
                    id: true,
                    src: true,
                },
            },
        },
    },
};

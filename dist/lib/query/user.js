"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectUserSimplified = exports.selectUser = exports.selectUserPublic = exports.excludeBlockingUser = exports.excludeBlockedUser = void 0;
const post_1 = require("./post");
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
    followedBy: {
        select: {
            id: true,
            username: true,
        },
    },
    following: {
        select: {
            id: true,
            username: true,
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
    posts: {
        take: 5,
        orderBy: {
            createdAt: "desc",
        },
        select: post_1.selectPost,
    },
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
    followedBy: {
        select: {
            id: true,
            username: true,
        },
    },
    following: {
        select: {
            id: true,
            username: true,
        },
    },
    _count: {
        select: {
            followedBy: true,
            following: true,
            posts: true,
        },
    },
    posts: {
        select: post_1.selectPost,
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

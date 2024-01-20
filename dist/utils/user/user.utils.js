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
exports.searchUsersByName = exports.findFollowUserByUserId = exports.findAllUser = exports.findUserById = exports.findUserPublic = exports.userSelectPublicInput = exports.userSelectInput = exports.userWhereAndInput = exports.getUserIsFollowed = void 0;
const user_models_1 = __importDefault(require("../../models/user.models"));
const user_normalize_1 = require("./user.normalize");
const error_1 = require("../../lib/error");
const user_1 = require("../../lib/query/user");
const __1 = require("..");
const messages_1 = require("../../lib/messages");
const getUserIsFollowed = (user, currentUserId) => {
    var _a;
    return currentUserId
        ? ((_a = user === null || user === void 0 ? void 0 : user.followedBy) !== null && _a !== void 0 ? _a : []).some((user) => user.id === currentUserId)
        : false;
};
exports.getUserIsFollowed = getUserIsFollowed;
const userWhereAndInput = (currentUserId) => [
    Object.assign(Object.assign({}, (0, user_1.excludeBlockedUser)(currentUserId)), (0, user_1.excludeBlockingUser)(currentUserId)),
];
exports.userWhereAndInput = userWhereAndInput;
const userSelectInput = (currentUserId) => (Object.assign(Object.assign({}, user_1.selectUser), { followedBy: Object.assign(Object.assign({}, user_1.selectUser.followedBy), { where: {
            AND: (0, exports.userWhereAndInput)(currentUserId),
        } }), following: Object.assign(Object.assign({}, user_1.selectUser.following), { where: {
            AND: (0, exports.userWhereAndInput)(currentUserId),
        } }) }));
exports.userSelectInput = userSelectInput;
const userSelectPublicInput = (currentUserId) => (Object.assign(Object.assign({}, user_1.selectUserPublic), { followedBy: Object.assign(Object.assign({}, user_1.selectUserPublic.followedBy), { where: {
            AND: (0, exports.userWhereAndInput)(currentUserId),
        } }), following: Object.assign(Object.assign({}, user_1.selectUserPublic.following), { where: {
            AND: (0, exports.userWhereAndInput)(currentUserId),
        } }) }));
exports.userSelectPublicInput = userSelectPublicInput;
const findUserPublic = (id, currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_models_1.default.findUnique({
        where: {
            id: Number(id),
            AND: (0, exports.userWhereAndInput)(currentUserId),
        },
        select: (0, exports.userSelectPublicInput)(currentUserId),
    });
    if (!user)
        throw new error_1.RequestError(messages_1.NotFound.USER, 404);
    const isFollowed = (0, exports.getUserIsFollowed)(user, currentUserId);
    const normalizedUser = yield (0, user_normalize_1.normalizeUserPublic)(user, isFollowed);
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
        select: (0, exports.userSelectInput)(currentUserId),
    });
    if (!user)
        throw new error_1.RequestError(customMessage.message, customMessage.statusCode);
    const isFollowed = (0, exports.getUserIsFollowed)(user, currentUserId);
    const normalizedUser = yield (0, user_normalize_1.normalizeUser)(user, isFollowed);
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
        const isFollowed = (0, exports.getUserIsFollowed)(user, userId);
        return Promise.resolve((0, user_normalize_1.normalizeUser)(user, isFollowed));
    }));
    return { data: normalizedUser, total: totalUsers };
});
exports.findAllUser = findAllUser;
// export const findFollowUserByUserEmail = async (
//   userEmail: string,
//   types: "following" | "followedBy",
//   currentUserId?: number
// ) => {
//   const user = await User.findUnique({
//     where: {
//       AND: userWhereAndInput(currentUserId),
//       email: userEmail,
//     },
//     select: {
//       [types]: {
//         select: { id: true },
//         where: {
//           AND: userWhereAndInput(currentUserId),
//         },
//       },
//       _count: {
//         select: {
//           [types]: true,
//         },
//       },
//     },
//   });
//   if (!user) throw new RequestError(NotFound.USER, 404);
//   return {
//     [types]: [...(user?.[types]?.map((user) => user.id) ?? [])],
//     total: user?._count ?? 0,
//   };
// };
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
                return (Object.assign(Object.assign({}, rest), { avatarImage: (0, __1.getCompleteFileUrlPath)(profile === null || profile === void 0 ? void 0 : profile.avatarImage) }));
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
                ...(0, exports.userWhereAndInput)(currentUserId),
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
        select: (0, exports.userSelectPublicInput)(currentUserId),
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
                ...(0, exports.userWhereAndInput)(currentUserId),
                ...filterQuery,
                {
                    id: {
                        not: cuId,
                    },
                },
            ],
        },
    });
    const normalizedUsers = yield Promise.all(users.map((user) => {
        const isFollowed = (0, exports.getUserIsFollowed)(user, cuId);
        return Promise.resolve((0, user_normalize_1.normalizeUserPublic)(user, isFollowed));
    }));
    return { data: normalizedUsers, total };
});
exports.searchUsersByName = searchUsersByName;
// export const searchUsersByName = async ({
//   limit = 20,
//   offset = 0,
//   query,
//   currentUserId,
//   filter,
// }: {
//   query: string;
//   limit?: number;
//   offset?: number;
//   currentUserId?: number;
//   filter?: SearchFilter;
// }) => {
//   const cuId =
//     currentUserId || currentUserId === 0 ? currentUserId : Prisma.empty;
//   const usersQuery = `%${query}%`;
//   let filteredTable = Prisma.raw(
//     `SELECT u.id, u.firstName, u.lastName, u.username, u.createdAt, u.updatedAt, u.email from users u`
//   );
//   const notFollowedUsers = Prisma.raw(
//     `SELECT distinct u2.id, u2.firstName, u2.lastName, u2.username, u2.createdAt, u2.updatedAt, u2.email from users u left join _userfollows uf on (u.id = uf.B) INNER JOIN astro_link.users u2 on (u2.id = uf.A) where uf.B != ${cuId}`
//   );
//   const followedUsers = Prisma.raw(
//     `SELECT distinct u2.id, u2.firstName, u2.lastName, u2.username, u2.createdAt, u2.updatedAt, u2.email from users u left join _userfollows uf on (u.id = uf.A) INNER JOIN astro_link.users u2 on (u2.id = uf.B) where uf.B = ${cuId}`
//   );
//   if (filter === "followed") {
//     filteredTable = followedUsers;
//   } else if (filter === "not_followed") {
//     filteredTable = notFollowedUsers;
//   }
//   // const filterTable = filter ? `(${subUsers})` : `users`;
//   const queryResults = await prisma.$queryRaw<
//     {
//       firstName: string;
//       lastName: string;
//       id: number;
//       username: string;
//       createdAt: Date;
//       updatedAt: Date;
//       profileDescription: string | null;
//       coverId: number | null;
//       coverSrc: string | null;
//       imageSrc: string | null;
//       imageId: number | null;
//       postId: number | null;
//       gender: $Enums.Gender | null;
//       birthDate: Date | null;
//       authorId: number | null;
//     }[]
//   >`SELECT u.id, u.firstName, u.lastName, u.username, u.createdAt, u.updatedAt, pr.profileDescription, pr.gender, pr.birthDate, cvI.id as coverId, cvI.src as coverSrc, img.src as imageSrc, img.id as imageId, p.id as 'postId', p.authorId
//     FROM users AS u
//     INNER JOIN profiles as pr ON (u.email = pr.userId)
//     LEFT JOIN _blockedusers as bu ON (u.id = bu.B and bu.A = ${cuId})
//     LEFT JOIN _blockedusers as bu2 ON (u.id = bu2.A and bu2.B = ${cuId})
//     LEFT JOIN coverImage as cvI ON (pr.id = cvI.profileId)
//     LEFT JOIN images as img ON (pr.id = img.profileId)
//     LEFT JOIN posts as p ON (p.authorId = u.id AND p.type in('friends', 'public'))
//     WHERE bu.A IS NULL AND bu2.B IS NULL AND (CONCAT(u.firstName, ' ', u.lastName)
//     LIKE ${usersQuery} OR u.username LIKE ${usersQuery}) ORDER BY CONCAT(u.firstName, ' ',u.lastName) ASC, u.username ASC`;
//   const userResults: UserAccountPublic[] = await Promise.all(
//     queryResults
//       .filter((obj, index) => {
//         return (
//           index === queryResults.findIndex((o) => obj.authorId === o.authorId)
//         );
//       })
//       .map(async (obj) => {
//         const posts = queryResults
//           .filter((post, index) => post.authorId === obj.id)
//           .map(({ postId }) => JSON.stringify({ id: postId }));
//         const subQuerys = Prisma.raw(`SELECT u.id FROM users u
//         LEFT JOIN _blockedusers as bu ON (u.id = bu.B and bu.A = ${cuId})
//         LEFT JOIN _blockedusers as bu2 ON (u.id = bu2.A and bu2.B = ${cuId})
//         WHERE bu.A IS NULL AND bu2.B IS NULL`);
//         const followersIds: { id: number }[] =
//           await prisma.$queryRaw`SELECT u2.id FROM (${subQuerys}) u
//           INNER JOIN _userfollows uf ON (uf.A = u.id)
//           INNER JOIN (${subQuerys}) u2 ON (uf.B = u2.id)
//           WHERE u.id = ${obj?.id ? obj.id : Prisma.empty}`;
//         const followedUsersIds: { id: number }[] =
//           await prisma.$queryRaw`SELECT u2.id FROM (${subQuerys}) u
//           INNER JOIN _userfollows uf ON (uf.B = u.id)
//           INNER JOIN (${subQuerys}) u2 ON (uf.A = u2.id)
//           WHERE u.id = ${obj?.id ? obj.id : Prisma.empty}`;
//         const uniquePosts = new Set(posts);
//         return {
//           id: obj?.id,
//           firstName: obj?.firstName,
//           lastName: obj?.lastName,
//           username: obj?.username,
//           createdAt: obj?.createdAt,
//           updatedAt: obj?.updatedAt,
//           profile: {
//             birthDate: obj?.birthDate,
//             gender: obj?.gender,
//             description: obj?.profileDescription,
//             image: getCompleteFileUrlPath(
//               obj?.imageSrc ? { src: obj?.imageSrc } : null
//             ),
//             coverImage: getCompleteFileUrlPath(
//               obj?.coverSrc ? { src: obj?.coverSrc } : null
//             ),
//           },
//           followedBy: {
//             followerIds: [...(followersIds ?? []).map((user) => user.id)],
//             total: (followersIds ?? []).length,
//           },
//           following: {
//             followedUserIds: [
//               ...(followedUsersIds ?? []).map((user) => user.id),
//             ],
//             total: (followedUsersIds ?? []).length,
//           },
//           posts: {
//             postIds: [
//               ...Array.from(uniquePosts ?? [])
//                 .map((obj) => JSON.parse(obj))
//                 .map((obj) => obj.id),
//             ],
//             total: Array.from(uniquePosts ?? []).length,
//           },
//         };
//       })
//   ).then((users) => users.slice(offset).slice(0, limit));
//   const totalResults: [{ total_results: number }] =
//     await prisma.$queryRaw`SELECT COUNT(id) as total_results FROM users u
//     LEFT JOIN _blockedusers as bu ON (u.id = bu.B and bu.A = ${
//       currentUserId || currentUserId === 0 ? currentUserId : Prisma.empty
//     })
//     LEFT JOIN _blockedusers as bu2 ON (u.id = bu2.A and bu2.B = ${
//       currentUserId || currentUserId === 0 ? currentUserId : Prisma.empty
//     }) WHERE bu.A IS NULL AND bu2.B IS NULL AND (CONCAT(u.firstName, ' ', u.lastName) LIKE ${usersQuery} OR u.username LIKE ${usersQuery})`;
//   return {
//     data: userResults,
//     total: Number(totalResults[0].total_results),
//   };
// };
// Post extended query
// `SELECT u.id, u.firstName, u.lastName, u.username, u.createdAt, u.updatedAt, pr.profileDescription, cvI.id as coverId, cvI.src as coverSrc, img.src as imageSrc, img.id as imageId, p.content, p.title, p.id as 'postId', p.authorId, postImgSrc, postImgId, imgPostId
//     FROM users AS u
//     INNER JOIN profiles as pr ON (u.email = pr.userId)
//     LEFT JOIN coverImage as cvI ON (pr.id = cvI.profileId)
//     LEFT JOIN images as img ON (pr.id = img.profileId)
//     LEFT JOIN (
//       SELECT p2.*, img.src as postImgSrc, img.id as postImgId, img.postId as imgPostId, ROW_NUMBER() OVER (PARTITION BY p2.authorId ORDER BY p2.createdAt DESC) as row_num
//       FROM posts as p2 LEFT JOIN images img ON (img.postId = p2.id)
//   ) as p ON (p.authorId = u.id AND p.row_num <= 5)
//     WHERE CONCAT(u.firstName, ' ', u.lastName) LIKE ${usersQuery} OR u.username LIKE ${usersQuery}
//     ORDER BY p.createdAt DESC
//     `
// Conversion
// const posts = queryResults
//   .filter((post, index) => post.authorId === obj.id)
//   .map(
//     ({
//       authorId,
//       firstName,
//       lastName,
//       username,
//       imageSrc,
//       content,
//       title,
//       postId,
//       ...post
//     }) =>
//       JSON.stringify({
//         author: {
//           id: authorId,
//           firstName,
//           lastName,
//           username,
//           image: { src: imageSrc },
//         },
//         content,
//         title,
//         images: queryResults
//           .filter((post) => post.imgPostId === postId)
//           .map(({ postImgSrc, postImgId, ...post }) => ({
//             id: postImgId,
//             src: postImgSrc,
//           })),
//         id: postId,
//       })
//   );
// types
// {
//   firstName: string;
//   lastName: string;
//   id: number;
//   username: string;
//   createdAt: Date;
//   updatedAt: Date;
//   profileDescription: string | null;
//   coverId: number | null;
//   coverSrc: string | null;
//   imageSrc: string | null;
//   imageId: number | null;
//   content: string | null;
//   title: string | null;
//   postId: number | null;
//   authorId: number | null;
//   postImgSrc: string | null;
//   postImgId: number | null;
//   imgPostId: number | null;
// }[]

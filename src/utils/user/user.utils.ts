import User from "../../models/user.models";
import { SearchFilter, UserAccount } from "../../types/user";
import { normalizeUser, normalizeUserPublic } from "./user.normalize";
import { RequestError } from "../../lib/error";
import {
  SelectUserPayload,
  SelectUserPublicPayload,
  excludeBlockedUser,
  excludeBlockingUser,
  selectUser,
  selectUserPublic,
} from "../../lib/query/user";
import { getCompleteFileUrlPath } from "..";
import { Prisma } from "@prisma/client";

export const getUserIsFollowed = (
  user: SelectUserPayload | SelectUserPublicPayload,
  currentUserId?: number
) =>
  currentUserId
    ? (user?.followedBy ?? []).some((user) => user.id === currentUserId)
    : false;

export const userWhereAndInput = (currentUserId?: number) =>
  [
    {
      ...excludeBlockedUser(currentUserId),
      ...excludeBlockingUser(currentUserId),
    },
  ] satisfies Prisma.UserWhereInput["AND"];

export const userSelectInput = (currentUserId?: number) =>
  ({
    ...selectUser,
    followedBy: {
      ...selectUser.followedBy,
      where: {
        AND: userWhereAndInput(currentUserId),
      },
    },
    following: {
      ...selectUser.following,
      where: {
        AND: userWhereAndInput(currentUserId),
      },
    },
  } satisfies Prisma.UserSelect);

export const userSelectPublicInput = (currentUserId?: number) =>
  ({
    ...selectUserPublic,
    followedBy: {
      ...selectUserPublic.followedBy,
      where: {
        AND: userWhereAndInput(currentUserId),
      },
    },
    following: {
      ...selectUserPublic.following,
      where: {
        AND: userWhereAndInput(currentUserId),
      },
    },
  } satisfies Prisma.UserSelect);

export const findUserPublic = async (id: string, currentUserId?: number) => {
  const user = await User.findUnique({
    where: {
      id: Number(id),
      AND: userWhereAndInput(currentUserId),
    },
    select: userSelectPublicInput(currentUserId),
  });

  if (!user) throw new RequestError("User not found", 404);

  const isFollowed = getUserIsFollowed(user, currentUserId);
  return normalizeUserPublic(user, isFollowed);
};

export const findUserById = async (
  id: number,
  currentUserId?: number,
  customMessage: { message: string; statusCode: number } = {
    message: "User not found",
    statusCode: 404,
  }
) => {
  const user = await User.findUnique({
    where: {
      AND: userWhereAndInput(currentUserId),
      id,
    },
    select: userSelectInput(currentUserId),
  });

  if (!user)
    throw new RequestError(customMessage.message, customMessage.statusCode);

  const isFollowed = getUserIsFollowed(user, currentUserId);

  return normalizeUser(user, isFollowed);
};

export const findAllUser = async ({
  limit,
  offset,
  userId,
}: {
  limit: number;
  offset: number;
  userId?: number;
}) => {
  const users = await User.findMany({
    select: { ...selectUser },
    take: limit,
    skip: offset,
    where: {
      AND: userWhereAndInput(userId),
    },
  });
  const totalUsers = await User.count({
    where: {
      AND: userWhereAndInput(userId),
    },
  });

  const normalizedUser: UserAccount[] = users.map((user) => {
    const isFollowed = getUserIsFollowed(user, userId);
    return normalizeUser(user, isFollowed);
  });

  return { data: normalizedUser, total: totalUsers };
};

export const findFollowUserByUserEmail = async (
  userEmail: string,
  types: "following" | "followedBy",
  currentUserId?: number
) => {
  const user = await User.findUnique({
    where: {
      AND: userWhereAndInput(currentUserId),
      email: userEmail,
    },
    select: {
      [types]: {
        select: { id: true },
        where: {
          AND: userWhereAndInput(currentUserId),
        },
      },
      _count: {
        select: {
          [types]: true,
        },
      },
    },
  });
  if (!user) throw new RequestError("User not found", 404);

  return {
    [types]: [...(user?.[types]?.map((user) => user.id) ?? [])],
    total: user?._count ?? 0,
  };
};

export const findFollowUserByUserId = async (
  userId: string,
  types: "following" | "followedBy",
  currentUserId?: number
) => {
  const user = await User.findUnique({
    where: {
      id: Number(userId),
      AND: userWhereAndInput(currentUserId),
    },
    select: {
      [types]: {
        where: {
          AND: userWhereAndInput(currentUserId),
        },
        select: {
          id: true,
          fullName: true,
          isOnline: true,
          username: true,
          firstName: true,
          lastName: true,
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
        },
      },
      _count: {
        select: {
          [types]: true,
        },
      },
    },
  });

  if (!user) throw new RequestError("User not found", 404);

  return {
    [types]: [
      ...(user?.[types]?.map(({ profile, ...rest }) => ({
        ...rest,
        image: getCompleteFileUrlPath((profile as any)?.avatarImage),
      })) ?? []),
    ],
    total: user?._count ?? 0,
  };
};

export const searchUsersByName = async ({
  limit = 20,
  offset = 0,
  query,
  currentUserId,
  filter,
}: {
  query: string;
  limit?: number;
  offset?: number;
  currentUserId?: number;
  filter?: SearchFilter;
}) => {
  const cuId = currentUserId || currentUserId === 0 ? currentUserId : undefined;
  let filterQuery = [
    {
      followedBy:
        filter === "not_followed"
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
  ] satisfies Prisma.UserWhereInput["AND"];

  const users = await User.findMany({
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
        ...userWhereAndInput(currentUserId),
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
    select: userSelectPublicInput(currentUserId),
  });

  const total = await User.count({
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
        ...userWhereAndInput(currentUserId),
        ...filterQuery,
        {
          id: {
            not: cuId,
          },
        },
      ],
    },
  });

  const normalizedUsers = users.map((user) => {
    const isFollowed = getUserIsFollowed(user, cuId);
    return normalizeUserPublic(user, isFollowed);
  });

  return { data: normalizedUsers, total };
};

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

import User from "../models/user";
import { UserAccount, UserAccountPublic } from "../types/user";
import { normalizeUser, normalizeUserPublic } from "./normalizeUser";
import { RequestError } from "../lib/error";
import {
  excludeBlockedUser,
  excludeBlockingUser,
  selectUser,
  selectUserPublic,
} from "../lib/query/user";
import { getFilePathname } from "./getFilePathname";
import prisma from "../config/prismaClient";
import { Prisma } from "@prisma/client";

export const findUserPublic = async (id: string, currentUserId?: number) => {
  const user = await User.findUnique({
    where: {
      id: Number(id),
      ...excludeBlockedUser(currentUserId),
      ...excludeBlockingUser(currentUserId),
    },
    select: selectUserPublic,
  });

  if (!user) throw new RequestError("User not found", 404);

  return normalizeUserPublic(user);
};

export const searchUsersByName = async ({
  limit = 20,
  offset = 0,
  query,
  currentUserId,
}: {
  query: string;
  limit?: number;
  offset?: number;
  currentUserId?: number;
}) => {
  const usersQuery = `%${query}%`;

  const queryResults = await prisma.$queryRaw<
    {
      firstName: string;
      lastName: string;
      id: number;
      username: string;
      createdAt: Date;
      updatedAt: Date;
      profileDescription: string | null;
      coverId: number | null;
      coverSrc: string | null;
      imageSrc: string | null;
      imageId: number | null;
      postId: number | null;
      authorId: number | null;
    }[]
  >`SELECT u.id, u.firstName, u.lastName, u.username, u.createdAt, u.updatedAt, pr.profileDescription, cvI.id as coverId, cvI.src as coverSrc, img.src as imageSrc, img.id as imageId, p.id as 'postId', p.authorId
    FROM users AS u
    INNER JOIN profiles as pr ON (u.email = pr.userId)
    LEFT JOIN coverImage as cvI ON (pr.id = cvI.profileId)
    LEFT JOIN images as img ON (pr.id = img.profileId)
    LEFT JOIN posts as p ON (p.authorId = u.id)
    WHERE CONCAT(u.firstName, ' ', u.lastName)
    LIKE ${usersQuery} OR u.username LIKE ${usersQuery} ORDER BY CONCAT(u.firstName, ' ',u.lastName) ASC, u.username ASC`;
  console.log(queryResults);
  const userResults: UserAccountPublic[] = await Promise.all(
    queryResults
      .filter((obj, index) => {
        return (
          index === queryResults.findIndex((o) => obj.authorId === o.authorId)
        );
      })
      .map(async (obj) => {
        const posts = queryResults
          .filter((post, index) => post.authorId === obj.id)
          .map(({ postId }) => JSON.stringify({ id: postId }));

        const followersIds: { id: number }[] =
          await prisma.$queryRaw`SELECT u2.id FROM users u INNER JOIN _userfollows uf ON (uf.A = u.id) INNER JOIN users u2 ON (uf.B = u2.id) WHERE u.id = ${
            obj?.id ? obj.id : Prisma.empty
          }`;
        const followedUsersIds: { id: number }[] =
          await prisma.$queryRaw`SELECT u2.id FROM users u INNER JOIN _userfollows uf ON (uf.B = u.id) INNER JOIN users u2 ON (uf.A = u2.id) WHERE u.id = ${
            obj?.id ? obj.id : Prisma.empty
          }`;

        const uniquePosts = new Set(posts);
        return {
          id: obj?.id,
          firstName: obj?.firstName,
          lastName: obj?.lastName,
          username: obj?.username,
          createdAt: obj?.createdAt,
          updatedAt: obj?.updatedAt,
          profile: {
            description: obj?.profileDescription,
            image: getFilePathname(
              obj?.imageSrc ? { src: obj?.imageSrc } : null
            ),
            coverImage: getFilePathname(
              obj?.coverSrc ? { src: obj?.coverSrc } : null
            ),
          },
          followedBy: {
            followerIds: [...(followersIds ?? []).map((user) => user.id)],
            total: (followersIds ?? []).length,
          },
          following: {
            followedUserIds: [
              ...(followedUsersIds ?? []).map((user) => user.id),
            ],
            total: (followedUsersIds ?? []).length,
          },
          posts: {
            postIds: [
              ...Array.from(uniquePosts ?? [])
                .map((obj) => JSON.parse(obj))
                .map((obj) => obj.id),
            ],
            total: Array.from(uniquePosts ?? []).length,
          },
        };
      })
  ).then((users) => users.slice(offset).slice(0, limit));

  const totalResults: [{ total_results: number }] =
    await prisma.$queryRaw`SELECT COUNT(id) as total_results FROM users u WHERE CONCAT(u.firstName, ' ', u.lastName) LIKE ${usersQuery} OR u.username LIKE ${usersQuery}`;

  return {
    data: userResults,
    total: Number(totalResults[0].total_results),
  };
};

export const findUser = async (email: string) => {
  const user = await User.findUnique({
    where: {
      email,
    },
    select: selectUser,
  });
  if (!user) throw new RequestError("User not found", 404);
  return normalizeUser(user);
};

export const findUserById = async (id: string) => {
  const user = await User.findUnique({
    where: {
      id: Number(id),
    },
    select: selectUser,
  });
  if (!user) throw new RequestError("User not found", 404);
  return normalizeUser(user);
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
      ...excludeBlockedUser(userId),
      ...excludeBlockingUser(userId),
    },
  });
  const totalUsers = await User.count({
    where: {
      ...excludeBlockedUser(userId),
      ...excludeBlockingUser(userId),
    },
  });

  const normalizedUser: UserAccount[] = users.map((user) =>
    normalizeUser(user)
  );

  return { data: normalizedUser, total: totalUsers };
};

export const findFollowUserByUserEmail = async (
  userEmail: string,
  types: "following" | "followedBy",
  currentUserId?: number
) => {
  const user = await User.findUnique({
    where: {
      email: userEmail,
    },
    select: {
      [types]: {
        select: { id: true },
        where: {
          ...excludeBlockedUser(currentUserId),
          ...excludeBlockingUser(currentUserId),
        },
      },
      _count: {
        select: {
          [types]: true,
        },
      },
    },
  });
  console.log(user);
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
    },
    select: {
      [types]: {
        where: {
          ...excludeBlockedUser(currentUserId),
          ...excludeBlockingUser(currentUserId),
        },
        select: {
          id: true,
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

  return {
    [types]: [
      ...(user?.[types]?.map(({ profile, ...rest }) => ({
        ...rest,
        image: getFilePathname((profile as any)?.avatarImage),
      })) ?? []),
    ],
    total: user?._count ?? 0,
  };
};

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

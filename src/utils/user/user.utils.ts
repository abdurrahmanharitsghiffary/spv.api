import User from "../../models/user.models";
import { SearchFilter, UserAccount } from "../../types/user";
import { normalizeUser, normalizeUserPublic } from "./user.normalize";
import { RequestError } from "../../lib/error";
import {
  excludeBlockedUser,
  excludeBlockingUser,
  selectUser,
  selectUserPublic,
  selectUserSimplified,
} from "../../lib/query/user";
import { Prisma } from "@prisma/client";
import { NotFound } from "../../lib/messages";

export const userWhereAndInput = (currentUserId?: number) =>
  currentUserId
    ? ([
        {
          ...excludeBlockedUser(currentUserId),
          ...excludeBlockingUser(currentUserId),
        },
      ] satisfies Prisma.UserWhereInput["AND"])
    : undefined;

export const findUserPublic = async (id: string, currentUserId?: number) => {
  const user = await User.findUnique({
    where: {
      id: Number(id),
      AND: userWhereAndInput(currentUserId),
    },
    select: selectUserPublic,
  });

  if (!user) throw new RequestError(NotFound.USER, 404);

  const normalizedUser = await normalizeUserPublic(user);
  return normalizedUser;
};

export const findUserById = async (
  id: number,
  currentUserId?: number,
  customMessage: { message: string; statusCode: number } = {
    message: NotFound.USER,
    statusCode: 404,
  }
) => {
  const user = await User.findUnique({
    where: {
      AND: userWhereAndInput(currentUserId),
      id,
    },
    select: selectUser,
  });

  if (!user)
    throw new RequestError(customMessage.message, customMessage.statusCode);

  const normalizedUser = await normalizeUser(user);
  return normalizedUser;
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

  const normalizedUser: UserAccount[] = await Promise.all(
    users.map((user) => {
      return Promise.resolve(normalizeUser(user));
    })
  );

  return { data: normalizedUser, total: totalUsers };
};

export const findFollowUserByUserId = async ({
  types,
  userId,
  currentUserId,
  limit = 20,
  offset = 0,
}: {
  userId: string;
  types: "following" | "followedBy";
  currentUserId?: number;
  limit?: number;
  offset?: number;
}) => {
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
          ...selectUserSimplified,
        },
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

  if (!user) throw new RequestError(NotFound.USER, 404);

  return {
    data: [
      ...(user?.[types]?.map(({ profile, ...rest }) => ({
        ...rest,
        avatarImage: (profile as any)?.avatarImage,
      })) ?? []),
    ],
    total: (user?._count?.[types as any] as unknown as number) ?? 0,
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

  const andInput = userWhereAndInput(currentUserId);

  const users = await User.findMany({
    where: {
      OR: [
        {
          fullName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
      AND: [
        ...(andInput ?? []),
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
    select: selectUserPublic,
  });

  const total = await User.count({
    where: {
      OR: [
        {
          fullName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
      AND: [
        ...(andInput ?? []),
        ...filterQuery,
        {
          id: {
            not: cuId,
          },
        },
      ],
    },
  });

  const normalizedUsers = await Promise.all(
    users.map((user) => Promise.resolve(normalizeUserPublic(user)))
  );

  return { data: normalizedUsers, total };
};

export const checkIsUserFound = async ({
  userId,
  currentUserId,
  select,
}: {
  userId: number;
  currentUserId?: number;
  select?: Prisma.UserSelect;
}) => {
  const andInput = currentUserId ? userWhereAndInput(currentUserId) : undefined;
  const user = await User.findUnique({
    where: {
      id: userId,
      AND: andInput,
    },
    select: { id: true, ...select },
  });

  if (!user) throw new RequestError(NotFound.USER, 404);

  return user;
};

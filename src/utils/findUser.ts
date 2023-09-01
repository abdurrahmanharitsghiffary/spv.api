import User from "../models/user";
import { UserAccount } from "../types/user";
import { normalizeUser, normalizeUserPublic } from "./normalizeUser";
import { RequestError } from "../lib/error";
import { selectUser, selectUserPublic } from "../lib/query/user";

export const findUserPublic = async (id: string) => {
  const user = await User.findUnique({
    where: { id: Number(id) },
    select: selectUserPublic,
  });

  if (!user) throw new RequestError("User not found", 404);

  return normalizeUserPublic(user);
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
}: {
  limit: number;
  offset: number;
}) => {
  const users = await User.findMany({
    select: selectUser,
    take: limit,
    skip: offset,
  });

  const normalizedUser: UserAccount[] = users.map((user) =>
    normalizeUser(user)
  );

  return normalizedUser;
};

export const findFollowUserByUserEmail = async (
  userEmail: string,
  types: "following" | "followedBy"
) => {
  const user = await User.findUnique({
    where: {
      email: userEmail,
    },
    select: {
      [types]: {
        select: {
          id: true,
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
  types: "following" | "followedBy"
) => {
  const user = await User.findUnique({
    where: {
      id: Number(userId),
    },
    select: {
      [types]: {
        select: {
          id: true,
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

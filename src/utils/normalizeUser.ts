import { SelectUserPayload, SelectUserPublicPayload } from "../lib/query/user";
import { UserAccount, UserAccountPublic } from "../types/user";

const getIds = (
  data: SelectUserPayload | SelectUserPublicPayload,
  types: "followedBy" | "following" | "posts"
) => {
  return [...(data?.[types]?.map((user) => user?.id) ?? [])];
};

export const normalizeUserPublic = (
  user: SelectUserPublicPayload
): UserAccountPublic => {
  const normalizedUserPublic: UserAccountPublic = {
    id: user?.id,
    username: user?.username,
    profile: user.profile
      ? {
          description: user.profile.profileDescription,
          image: user.profile.avatarImage,
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
    postIds: { postIds: getIds(user, "posts"), total: user._count.posts },
    updatedAt: user.updatedAt,
    createdAt: user?.createdAt,
  };

  return normalizedUserPublic;
};

export const normalizeUser = (user: SelectUserPayload): UserAccount => {
  const normalizedUser: UserAccount = {
    id: user?.id,
    username: user?.username,
    email: user?.email,
    role: user?.role,
    profile: user.profile
      ? {
          description: user.profile.profileDescription,
          image: user.profile.avatarImage,
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
    postIds: { postIds: getIds(user, "posts"), total: user._count.posts },
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
  };

  return normalizedUser;
};

import { SelectUserPayload, SelectUserPublicPayload } from "../lib/query/user";
import { UserAccount, UserAccountPublic } from "../types/user";
import { getFilePathname } from "./getFilePathname";

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
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
    profile: user.profile
      ? {
          description: user.profile.profileDescription,
          image: getFilePathname(user.profile.avatarImage),
          coverImage: getFilePathname(user.profile.coverImage),
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
    createdAt: user?.createdAt,
  };

  return normalizedUserPublic;
};

export const normalizeUser = (user: SelectUserPayload): UserAccount => {
  const normalizedUser: UserAccount = {
    id: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
    email: user?.email,
    verified: user?.verified,
    role: user?.role,
    profile: user.profile
      ? {
          description: user.profile.profileDescription,
          image: getFilePathname(user.profile.avatarImage),
          coverImage: getFilePathname(user.profile.coverImage),
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
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
  };
  // if (user.profile?.avatarImage && normalizedUser.profile) {
  //   normalizedUser.profile.image = {
  //     src: new URL(user.profile.avatarImage.src, baseUrl).href,
  //   };
  // }
  return normalizedUser;
};

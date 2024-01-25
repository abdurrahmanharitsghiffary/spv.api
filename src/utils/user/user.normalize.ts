import {
  SelectUserPayload,
  SelectUserPublicPayload,
  SelectUserSimplifiedPayload,
} from "../../lib/query/user";
import {
  UserAccount,
  UserAccountPublic,
  UserSimplified,
} from "../../types/user";

type SelectUserPublicPayloadExtended = SelectUserPublicPayload;
type SelectUserPayloadExtended = SelectUserPayload;

const getIds = (
  data: SelectUserPayload | SelectUserPublicPayload,
  types: "followedBy" | "following" | "posts"
) => {
  return [...(data?.[types]?.map((user) => user?.id) ?? [])];
};

export const normalizeUserPublic = (
  user: SelectUserPublicPayloadExtended
): Promise<UserAccountPublic> =>
  new Promise((resolve) => {
    const normalizedUserPublic: UserAccountPublic = {
      id: user?.id,
      isOnline: user?.isOnline,
      firstName: user?.firstName,
      lastName: user?.lastName,
      fullName: user?.fullName,
      username: user?.username,
      profile: user.profile
        ? {
            birthDate: user.profile?.birthDate,
            gender: user.profile?.gender,
            description: user.profile.profileDescription,
            avatarImage: user.profile.avatarImage,
            coverImage: user.profile.coverImage,
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

    return resolve(normalizedUserPublic);
  });

export const normalizeUser = (
  user: SelectUserPayloadExtended
): Promise<UserAccount> =>
  new Promise((resolve) => {
    const normalizedUser: UserAccount = {
      id: user?.id,
      isOnline: user?.isOnline,
      provider: user?.provider,
      firstName: user?.firstName,
      lastName: user?.lastName,
      fullName: user?.fullName,
      username: user?.username,
      email: user?.email,
      verified: user?.verified,
      role: user?.role,
      profile: user.profile
        ? {
            birthDate: user.profile?.birthDate,
            gender: user.profile?.gender,
            description: user.profile.profileDescription,
            avatarImage: user.profile.avatarImage,
            coverImage: user.profile.coverImage,
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
    //     src: new URL(user.profile.avatarImage.src, BASE_URL).href,
    //   };
    // }
    return resolve(normalizedUser);
  });

export const simplifyUser = (
  user:
    | SelectUserPayloadExtended
    | SelectUserSimplifiedPayload
    | SelectUserPublicPayloadExtended
): Promise<UserSimplified> =>
  new Promise((resolve) => {
    return resolve({
      avatarImage: user.profile?.avatarImage,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user?.fullName,
      id: user.id,
      isOnline: user.isOnline,
      username: user.username,
    });
  });

export const simplifyUserWF = (
  user:
    | SelectUserPayloadExtended
    | SelectUserSimplifiedPayload
    | SelectUserPublicPayloadExtended
): Promise<UserSimplified> =>
  new Promise((resolve) => {
    return resolve({
      avatarImage: user.profile?.avatarImage,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user?.fullName,
      id: user.id,
      isOnline: user.isOnline,
      username: user.username,
    });
  });

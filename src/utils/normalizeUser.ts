import { SelectUserPayload, SelectUserPublicPayload } from "../lib/query/user";
import { UserAccount, UserAccountPublic } from "../types/user";

const getIds = (
  data: SelectUserPayload | SelectUserPublicPayload,
  types: "followedBy" | "following" | "posts"
) => {
  return [...(data?.[types]?.map((user) => user?.id) ?? [])];
};

export const normalizeUserPublic = (user: SelectUserPublicPayload) => {
  const normalizedUserPublic: UserAccountPublic = {
    id: user?.id,
    username: user?.username,
    profile: user?.profile,
    followedBy: getIds(user, "followedBy"),
    following: getIds(user, "following"),
    postIds: getIds(user, "posts"),
    createdAt: user?.createdAt,
  };
  return normalizedUserPublic;
};

export const normalizeUser = (user: SelectUserPayload) => {
  const normalizedUser: UserAccount = {
    id: user?.id,
    username: user?.username,
    email: user?.email,
    role: user?.role,
    profile: user?.profile,
    followedBy: getIds(user, "followedBy"),
    following: getIds(user, "following"),
    postIds: getIds(user, "posts"),
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
  };
  return normalizedUser;
};

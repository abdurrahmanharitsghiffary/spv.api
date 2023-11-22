import { Prisma } from "@prisma/client";
import { selectPost } from "./post";

export const excludeBlockedUser = (userId: number | undefined) => {
  const prismaQuery = {
    blocking: {
      every: {
        id: {
          not: userId || userId === 0 ? userId : undefined,
        },
      },
    },
  } satisfies Prisma.UserWhereInput;

  return prismaQuery;
};

export const excludeBlockingUser = (userId: number | undefined) => {
  const prismaQuery = {
    blocked: {
      every: {
        id: {
          not: userId || userId === 0 ? userId : undefined,
        },
      },
    },
  } satisfies Prisma.UserWhereInput;

  return prismaQuery;
};

export const selectUserPublic = {
  id: true,
  firstName: true,
  lastName: true,
  fullName: true,
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
    select: selectPost,
  },
} satisfies Prisma.UserSelect;

export type SelectUserPublicPayload = Prisma.UserGetPayload<{
  select: typeof selectUserPublic;
}>;

export const selectUser = {
  id: true,
  provider: true,
  verified: true,
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
    select: selectPost,
  },
} satisfies Prisma.UserSelect;

export type SelectUserPayload = Prisma.UserGetPayload<{
  select: typeof selectUser;
}>;

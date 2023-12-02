import { Prisma } from "@prisma/client";
import { selectUserSimplified } from "./user";

// export const selectAuthorPost = {
//   author: {
//     select: selectUserSimplified,
//   },
// } satisfies Prisma.PostSelect;
// export type SelectAuthorPost = Prisma.PostGetPayload<{
//   select: typeof selectAuthorPost;
// }>;

export const selectPost = {
  id: true,
  title: true,
  content: true,
  updatedAt: true,
  _count: { select: { likes: true, comments: true } },
  images: {
    select: {
      id: true,
      src: true,
    },
  },
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      fullName: true,
      isOnline: true,
      username: true,
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
  comments: {
    where: {
      parentId: null,
    },
    select: {
      id: true,
    },
  },
  createdAt: true,
} satisfies Prisma.PostSelect;

export type SelectPostPayload = Prisma.PostGetPayload<{
  select: typeof selectPost;
}>;

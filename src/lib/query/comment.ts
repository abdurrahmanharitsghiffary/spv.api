import { Prisma } from "@prisma/client";

export const selectSingleComment = {
  id: true,
  postId: true,
  comment: true,
  createdAt: true,
  image: { select: { src: true } },
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      profile: {
        select: { avatarImage: { select: { src: true } } },
      },
    },
  },
  updatedAt: true,
  _count: true,
} satisfies Prisma.CommentSelect;

export const selectComment = {
  ...selectSingleComment,
  childrenComment: {
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
    },
  },
} satisfies Prisma.CommentSelect;

export type SelectSingleCommentPayload = Prisma.CommentGetPayload<{
  select: typeof selectSingleComment;
}>;

export type SelectCommentPayload = Prisma.CommentGetPayload<{
  select: typeof selectComment;
}>;

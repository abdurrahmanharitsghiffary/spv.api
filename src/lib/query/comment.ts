import { Prisma } from "@prisma/client";
import { selectUserSimplified } from "./user";

export const selectSingleComment = {
  id: true,
  postId: true,
  comment: true,
  createdAt: true,
  image: { select: { src: true } },
  user: {
    select: {
      ...selectUserSimplified,
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

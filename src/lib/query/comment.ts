import { Prisma } from "@prisma/client";

export const selectComment = {
  id: true,
  postId: true,
  comment: true,
  createdAt: true,
  image: true,
  user: {
    select: {
      id: true,
      username: true,
      profile: {
        select: { avatarImage: { select: { id: true, src: true } } },
      },
    },
  },
  childrenComment: {
    select: { id: true },
  },
} satisfies Prisma.CommentSelect;

export type SelectCommentPayload = Prisma.CommentGetPayload<{
  select: typeof selectComment;
}>;

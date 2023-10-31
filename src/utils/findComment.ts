import { Prisma } from "@prisma/client";
import { RequestError } from "../lib/error";
import { selectComment } from "../lib/query/comment";
import Comment from "../models/comment";
import { normalizeComment, normalizeComments } from "./normalizeComment";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";

const commentWhereAndInput = (currentUserId?: number) =>
  [
    {
      post: {
        author: {
          ...excludeBlockedUser(currentUserId),
          ...excludeBlockingUser(currentUserId),
        },
      },
    },
    {
      OR: [
        { parentId: null },
        {
          parentComment: {
            user: {
              ...excludeBlockedUser(currentUserId),
              ...excludeBlockingUser(currentUserId),
            },
          },
        },
      ],
    },
    {
      user: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
  ] satisfies Prisma.CommentWhereUniqueInput["AND"];

const commentSelectChildrenCommentInput = (currentUserId?: number) =>
  ({
    ...selectComment.childrenComment,
    where: {
      AND: [
        {
          user: {
            ...excludeBlockedUser(currentUserId),
            ...excludeBlockingUser(currentUserId),
          },
        },
      ],
    },
  } satisfies Prisma.CommentSelect["childrenComment"]);

export const findCommentById = async (
  commentId: number,
  currentUserId?: number
) => {
  const comment = await Comment.findUnique({
    where: {
      id: commentId || commentId === 0 ? commentId : undefined,
      AND: commentWhereAndInput(currentUserId),
    },
    select: {
      ...selectComment,
      childrenComment: commentSelectChildrenCommentInput(currentUserId),
    },
  });
  console.log(comment);
  if (!comment) throw new RequestError("Comment not found", 404);

  return normalizeComment(comment);
};

export const findCommentByIdCustomMessage = async ({
  message,
  statusCode,
  commentId,
  currentUserId,
}: {
  commentId: number;
  message: string;
  statusCode: number;
  currentUserId?: number;
}) => {
  const comment = await Comment.findUnique({
    where: {
      id: commentId || commentId === 0 ? commentId : undefined,
      AND: commentWhereAndInput(currentUserId),
    },
    select: {
      ...selectComment,
      childrenComment: commentSelectChildrenCommentInput(currentUserId),
    },
  });

  if (!comment) throw new RequestError(message, statusCode);

  return normalizeComment(comment);
};

export const findCommentsByPostId = async (
  postId: number,
  offset: number,
  limit: number,
  sortBy: ("latest" | "oldest" | "highest" | "lowest" | string)[] = ["latest"],
  currentUserId?: number
) => {
  const sortOptions: Prisma.CommentOrderByWithRelationInput[] = [];

  sortBy?.forEach((sort) => {
    if (["highest", "lowest"].includes(sort)) {
      const likeSort: Prisma.CommentOrderByWithRelationInput = {
        likes: {
          _count: undefined,
        },
      };
      if (likeSort.likes) {
        if (sort === "highest") {
          likeSort.likes._count = "desc";
        } else {
          likeSort.likes._count = "asc";
        }
      }
      sortOptions.unshift(likeSort);
    } else if (["latest", "oldest"].includes(sort)) {
      const timeSort: Prisma.CommentOrderByWithRelationInput = {
        createdAt: undefined,
      };
      if (sort === "latest") {
        timeSort.createdAt = "desc";
      } else {
        timeSort.createdAt = "asc";
      }
      sortOptions.push(timeSort);
    }
  });

  const comments = await Comment.findMany({
    where: {
      postId,
      AND: [
        { parentId: null },
        {
          user: {
            ...excludeBlockedUser(currentUserId),
            ...excludeBlockingUser(currentUserId),
          },
        },
        {
          post: {
            author: {
              ...excludeBlockedUser(currentUserId),
              ...excludeBlockingUser(currentUserId),
            },
          },
        },
      ],
    },
    take: limit,
    skip: offset,
    orderBy: sortOptions,
    select: {
      ...selectComment,
      childrenComment: commentSelectChildrenCommentInput(currentUserId),
    },
  });

  const totalComments = await Comment.count({
    where: {
      postId,
      AND: [
        { parentId: null },
        {
          user: {
            ...excludeBlockedUser(currentUserId),
            ...excludeBlockingUser(currentUserId),
          },
        },
        {
          post: {
            author: {
              ...excludeBlockedUser(currentUserId),
              ...excludeBlockingUser(currentUserId),
            },
          },
        },
      ],
    },
  });

  return { data: normalizeComments(comments), total: totalComments };
};

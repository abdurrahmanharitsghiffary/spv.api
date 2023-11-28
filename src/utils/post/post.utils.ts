import { RequestError } from "../../lib/error";
import Post from "../../models/post.models";
import { selectPost } from "../../lib/query/post";
import { normalizePost } from "./post.normalize";
import prisma from "../../config/prismaClient";
import { excludeBlockedUser, excludeBlockingUser } from "../../lib/query/user";
import { Prisma } from "@prisma/client";

const postSelectExtended = (currentUserId?: number) =>
  ({
    ...selectPost,
    comments: {
      ...selectPost.comments,
      where: {
        parentId: null,
        user: {
          ...excludeBlockedUser(currentUserId),
          ...excludeBlockingUser(currentUserId),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    },
    likes: {
      select: {
        userId: true,
      },
      where: {
        userId: currentUserId,
      },
      take: 1,
    },
    follower: {
      select: {
        userId: true,
      },
      take: 1,
      where: {
        userId: currentUserId,
      },
    },
    author: {
      select: {
        ...selectPost.author.select,
        followedBy: {
          select: {
            id: true,
          },
          where: {
            id: currentUserId,
          },
        },
      },
    },
  } satisfies Prisma.PostSelect);

const postWhereInput = {
  type: {
    in: ["public", "friends"],
  },
} satisfies Prisma.PostWhereInput;

const postFindUniqueWhereInput = (
  postId: number | string,
  currentUserId: number
) =>
  ({
    id: Number(postId),
    AND: postWhereAndInput(currentUserId),
    OR: [
      {
        authorId: currentUserId,
        type: { in: ["friends", "private", "public"] },
      },
      { ...postWhereInput },
    ],
  } satisfies Prisma.PostWhereInput);

const postWhereAndInput = (currentUserId?: number) =>
  [
    {
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
  ] satisfies Prisma.PostWhereInput["AND"];

export const findPostByIdCustomMessage = async ({
  statusCode = 404,
  currentUserId,
  postId,
  message = "Post not found",
}: {
  statusCode?: number;
  postId: number;
  currentUserId?: number;
  message: string;
}) => {
  const post = await Post.findUnique({
    where: postFindUniqueWhereInput(postId, Number(currentUserId)),
    select: postSelectExtended(currentUserId),
  });

  if (!post) throw new RequestError(message, statusCode ?? 400);
  const normalizedPost = await normalizePost(post);
  return normalizedPost;
};

export const findPostById = async (postId: string, currentUserId?: number) => {
  const post = await Post.findUnique({
    where: postFindUniqueWhereInput(postId, Number(currentUserId)),
    select: postSelectExtended(currentUserId),
  });

  if (!post) throw new RequestError("Post not found", 404);
  const normalizedPost = await normalizePost(post);
  return normalizedPost;
};

export const findPostsByAuthorId = async ({
  authorId,
  offset,
  limit,
  currentUserId,
}: {
  authorId: number;
  offset?: number;
  limit?: number;
  currentUserId?: number;
}) => {
  const posts = await Post.findMany({
    where: {
      authorId,
      AND: postWhereAndInput(currentUserId),
      OR: [
        {
          authorId: currentUserId,
          type: { in: ["friends", "private", "public"] },
        },
        { authorId, ...postWhereInput },
      ],
    },
    select: postSelectExtended(currentUserId),
    orderBy: {
      createdAt: "desc",
    },
    take: limit ?? 20,
    skip: offset ?? 0,
  });
  const totalPosts = await Post.count({
    where: {
      authorId,
      AND: postWhereAndInput(currentUserId),
      OR: [
        {
          authorId: currentUserId,
          type: { in: ["friends", "private", "public"] },
        },
        { authorId, ...postWhereInput },
      ],
    },
  });

  return {
    data: await Promise.all(posts.map((post) => normalizePost(post))),
    total: totalPosts,
  };
};

export const findAllPosts = async ({
  limit,
  offset,
  currentUserId,
}: {
  limit?: number;
  offset?: number;
  currentUserId?: number;
}) => {
  const posts = await Post.findMany({
    where: {
      AND: postWhereAndInput(currentUserId),
    },
    orderBy: { createdAt: "desc" },
    select: postSelectExtended(currentUserId),
    skip: offset ?? 0,
    take: limit ?? 20,
  });

  const totalPosts = await Post.count({
    where: {
      AND: postWhereAndInput(currentUserId),
    },
  });

  return {
    data: await Promise.all(posts.map((post) => normalizePost(post))),
    total: totalPosts,
  };
};

export const findPostByFollowedUserIds = async ({
  followedUserIds,
  limit = 20,
  offset = 0,
  currentUserId,
}: {
  limit?: number;
  offset?: number;
  currentUserId?: number;
  followedUserIds: number[];
}) => {
  const posts = await Post.findMany({
    where: {
      AND: postWhereAndInput(currentUserId),
      ...postWhereInput,
      authorId: {
        in: [...followedUserIds],
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    distinct: "authorId",
    select: postSelectExtended(currentUserId),
  });

  const postsTotal = await Post.count({
    where: {
      AND: postWhereAndInput(currentUserId),
      ...postWhereInput,
      authorId: {
        in: [...followedUserIds],
      },
    },
  });

  return {
    data: await Promise.all(posts.map((post) => normalizePost(post))),
    total: postsTotal,
  };
};

export const findSavedPost = async ({
  userId,
  limit = 20,
  offset = 0,
  currentUserId,
}: {
  userId: number;
  limit: number;
  offset: number;
  currentUserId?: number;
}) => {
  const savedPosts = await prisma.savedPost.findMany({
    where: {
      post: {
        OR: [
          {
            author: {
              id: currentUserId,
            },
            type: { in: ["friends", "private", "public"] },
          },
          { ...postWhereInput },
        ],
        AND: postWhereAndInput(currentUserId),
      },
      userId: Number(userId),
    },
    skip: offset,
    take: limit,
    orderBy: {
      assignedAt: "desc",
    },
    select: {
      post: {
        select: postSelectExtended(currentUserId),
      },
      assignedAt: true,
    },
  });

  const total = await prisma.savedPost.count({
    where: {
      post: {
        OR: [
          {
            author: {
              id: currentUserId,
            },
            type: { in: ["friends", "private", "public"] },
          },
          { ...postWhereInput },
        ],
        AND: postWhereAndInput(currentUserId),
      },
      userId: Number(userId),
    },
  });

  return {
    data: await Promise.all(
      savedPosts.map((post) =>
        normalizePost({ ...post.post, assignedAt: post.assignedAt })
      )
    ),
    total,
  };
};

export const searchPosts = async ({
  query,
  limit = 20,
  offset = 0,
  currentUserId,
}: {
  query: string;
  limit: number;
  offset: number;
  currentUserId?: number;
}) => {
  const posts = await Post.findMany({
    where: {
      AND: postWhereAndInput(currentUserId),
      ...postWhereInput,
      OR: [
        {
          title: {
            contains: query,
          },
        },
        {
          content: {
            contains: query,
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: postSelectExtended(currentUserId),
    take: limit,
    skip: offset,
  });

  const resultsTotal = await Post.count({
    where: {
      AND: postWhereAndInput(currentUserId),
      ...postWhereInput,
      OR: [
        {
          title: {
            contains: query,
          },
        },
        {
          content: {
            contains: query,
          },
        },
      ],
    },
  });

  return {
    data: await Promise.all(posts.map((post) => normalizePost(post))),
    total: resultsTotal,
  };
};

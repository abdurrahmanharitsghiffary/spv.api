import { RequestError } from "../lib/error";
import Post from "../models/post";
import { selectPost } from "../lib/query/post";
import { normalizePost, normalizePosts } from "./normalizePost";
import prisma from "../config/prismaClient";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";

export const findPostByIdCustomMessage = async ({
  statusCode,
  currentUserId,
  postId,
  message,
}: {
  statusCode?: number;
  postId: number;
  currentUserId?: number;
  message: string;
}) => {
  const post = await Post.findUnique({
    where: {
      id: Number(postId),
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
    select: selectPost,
  });

  if (!post) throw new RequestError(message, statusCode ?? 400);

  return normalizePost(post);
};

export const findPostById = async (postId: string, currentUserId?: number) => {
  const post = await Post.findUnique({
    where: {
      id: Number(postId),
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
    select: selectPost,
  });

  if (!post) throw new RequestError("Post not found", 404);

  return normalizePost(post);
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
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
    select: selectPost,
    orderBy: {
      createdAt: "desc",
    },
    take: limit ?? 20,
    skip: offset ?? 0,
  });
  const totalPosts = await Post.count({
    where: {
      authorId,
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
  });

  return { data: normalizePosts(posts), total: totalPosts };
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
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
    select: selectPost,
    skip: offset ?? 0,
    take: limit ?? 20,
  });

  const totalPosts = await Post.count({
    where: {
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
    },
  });

  return { data: normalizePosts(posts), total: totalPosts };
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
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
      authorId: {
        in: [...followedUserIds],
      },
      type: {
        in: ["friends", "public"],
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    distinct: "authorId",
    select: selectPost,
  });

  const postsTotal = await Post.count({
    where: {
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
      authorId: {
        in: [...followedUserIds],
      },
      type: {
        in: ["friends", "public"],
      },
    },
  });

  return { data: normalizePosts(posts), total: postsTotal };
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
        author: {
          ...excludeBlockedUser(currentUserId),
          ...excludeBlockingUser(currentUserId),
        },
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
        select: selectPost,
      },
      assignedAt: true,
    },
  });

  const total = await prisma.savedPost.count({
    where: {
      post: {
        author: {
          ...excludeBlockedUser(currentUserId),
          ...excludeBlockingUser(currentUserId),
        },
      },
      userId: Number(userId),
    },
  });

  return {
    data: normalizePosts(
      savedPosts.map((post) => ({ ...post.post, assignedAt: post.assignedAt }))
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
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
      type: {
        in: ["friends", "public"],
      },
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
    select: selectPost,
    take: limit,
    skip: offset,
  });

  const resultsTotal = await Post.count({
    where: {
      author: {
        ...excludeBlockedUser(currentUserId),
        ...excludeBlockingUser(currentUserId),
      },
      type: {
        in: ["friends", "public"],
      },
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
    data: posts.map((post) => normalizePost(post)),
    total: resultsTotal,
  };
};

import { RequestError } from "../lib/error";
import Post from "../models/post";
import { selectPost } from "../lib/query/post";
import { normalizePost, normalizePosts } from "./normalizePost";

export const findPostById = async (postId: string) => {
  const post = await Post.findUnique({
    where: {
      id: Number(postId),
    },
    select: selectPost,
  });

  if (!post) throw new RequestError("Post not found", 404);
  console.log(post);
  return normalizePost(post);
};

export const findPostsByAuthorId = async ({
  authorId,
  offset,
  limit,
}: {
  authorId: number;
  offset?: number;
  limit?: number;
}) => {
  const posts = await Post.findMany({
    where: {
      authorId: authorId,
    },
    select: selectPost,
    take: limit ?? 20,
    skip: offset ?? 0,
  });

  return normalizePosts(posts);
};

export const findAllPosts = async ({
  limit,
  offset,
}: {
  limit?: number;
  offset?: number;
}) => {
  const posts = await Post.findMany({
    select: selectPost,
    skip: offset ?? 0,
    take: limit ?? 20,
  });

  return normalizePosts(posts);
};

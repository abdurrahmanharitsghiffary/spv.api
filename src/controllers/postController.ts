import express from "express";
import Post from "../models/post";
import { RequestError } from "../lib/error";
import { ExpressRequestExtended } from "../types/request";

const postSelect = {
  id: true,
  authorId: true,
  content: true,
  title: true,
  author: {
    select: {
      id: true,
      username: true,
    },
  },
};

export const checkPost = async (postId: string) => {
  const post = await Post.findUnique({
    where: {
      id: Number(postId),
    },
  });
  return post;
};

export const getAllMyPosts = async (
  req: express.Request,
  res: express.Response
) => {
  const posts = await Post.findMany({
    where: {
      authorId: Number((req as ExpressRequestExtended).userId),
    },
    select: postSelect,
  });

  return res.status(200).json(posts);
};

export const getAllPosts = async (
  req: express.Request,
  res: express.Response
) => {
  const posts = await Post.findMany({
    select: postSelect,
  });

  return res.status(200).json(posts);
};

export const getPost = async (req: express.Request, res: express.Response) => {
  const { postId } = req.params;

  const post = await Post.findUnique({
    where: {
      id: Number(postId),
    },
    include: {
      postReaction: true,
      author: {
        select: {
          username: true,
        },
      },
      comments: {
        where: {
          parentId: null,
        },
        select: {
          id: true,
          comment: true,
          createdAt: true,
          user: {
            select: { id: true, username: true },
          },
          childrenComment: {
            select: {
              id: true,
              comment: true,
              createdAt: true,
              user: {
                select: { id: true, username: true },
              },
            },
          },
        },
      },
    },
  });

  if (!post) throw new RequestError("Post not found!", 404);

  return res.status(200).json(post);
};

export const deletePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { postId } = req.params;

  await Post.delete({
    where: {
      id: Number(postId),
    },
  });

  return res.status(204).json();
};

export const updatePost = async (
  req: express.Request,
  res: express.Response
) => {
  const { title, content } = req.body;
  const { postId } = req.params;

  await Post.update({
    where: {
      id: Number(postId),
    },
    data: {
      title,
      content,
    },
  });

  return res.status(204).json();
};

export const createPost = async (
  req: express.Request,
  res: express.Response
) => {
  const { title, content } = req.body;

  await Post.create({
    data: {
      content,
      title,
      authorId: Number((req as ExpressRequestExtended).userId),
    },
  });

  return res.status(204).json();
};

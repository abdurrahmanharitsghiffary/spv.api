import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { ForbiddenError, RequestError } from "../lib/error";
import Post from "../models/post";

const checkPost = async (postId: string) => {
  const post = await Post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  if (!post) throw new RequestError("Post not found", 404);

  return post;
};

export const protectPost = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { postId } = req.params;
  const { userId } = req as ExpressRequestExtended;

  const postIsExist = await checkPost(postId);
  console.log(postIsExist);

  console.log(userId);
  if (!postIsExist) throw new RequestError("Post not found", 404);
  if (postIsExist?.authorId !== Number(userId)) throw new ForbiddenError();

  return next();
};

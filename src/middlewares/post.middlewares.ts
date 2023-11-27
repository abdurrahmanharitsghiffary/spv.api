import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { ForbiddenError, RequestError } from "../lib/error";
import { findPostById } from "../utils/post/post.utils";
import { PostLike } from "../models/post.models";

export const protectPost = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { postId } = req.params;
  const { userId } = req as ExpressRequestExtended;

  const post = await findPostById(postId, Number(userId));

  if (post?.author.id !== Number(userId)) throw new ForbiddenError();

  return next();
};

export const protectLike = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;

  const isExists = await PostLike.findUnique({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });

  if (!isExists) throw new RequestError("Data not found", 404);

  return next();
};

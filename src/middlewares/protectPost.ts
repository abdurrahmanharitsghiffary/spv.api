import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { ForbiddenError } from "../lib/error";
import { findPostById } from "../utils/findPost";

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

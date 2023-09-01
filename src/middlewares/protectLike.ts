import express from "express";
import { ExpressRequestExtended } from "../types/request";
import PostLike from "../models/postLike";
import { RequestError } from "../lib/error";

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

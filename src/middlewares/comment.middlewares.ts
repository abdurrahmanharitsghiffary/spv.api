import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { ForbiddenError } from "../lib/error";
import { checkCommentIsFound } from "../utils/comment/comment.utils";

export const protectComment = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;

  const comment = await checkCommentIsFound({
    commentId: Number(commentId),
    currentUserId: Number(userId),
  });
  if (comment?.userId !== Number(userId)) throw new ForbiddenError();

  return next();
};

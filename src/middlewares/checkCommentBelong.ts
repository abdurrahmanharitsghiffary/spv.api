import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";
import { checkComment } from "../controllers/commentController";

export const checkCommentBelong = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { commentId } = req.params;

  const comment = await checkComment(commentId);
  if (comment.userId !== Number((req as ExpressRequestExtended).userId))
    throw new RequestError("Access Denied", 403);

  return next();
};

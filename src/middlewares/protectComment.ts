import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { ForbiddenError, RequestError } from "../lib/error";
import Comment from "../models/comment";

const checkComment = async (commentId: string) => {
  const comment = await Comment.findUnique({
    where: {
      id: Number(commentId),
    },
  });

  if (!comment) throw new RequestError("Comment not found", 404);

  return comment;
};

export const protectComment = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { commentId } = req.params;

  const comment = await checkComment(commentId);
  if (comment?.userId !== Number((req as ExpressRequestExtended).userId))
    throw new ForbiddenError();

  return next();
};

import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { ForbiddenError } from "../lib/error";
import { findCommentById } from "../utils/findComment";

// const checkComment = async (commentId: string) => {
//   const comment = await Comment.findUnique({
//     where: {
//       id: Number(commentId),
//     },
//   });

//   if (!comment) throw new RequestError("Comment not found", 404);

//   return comment;
// };

export const protectComment = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;

  const comment = await findCommentById(Number(commentId), Number(userId));
  if (comment?.user.id !== Number(userId)) throw new ForbiddenError();

  return next();
};

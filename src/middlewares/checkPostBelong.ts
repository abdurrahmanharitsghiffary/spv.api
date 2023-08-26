import express from "express";
import { checkPost } from "../controllers/postController";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";

export const checkPostBelong = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { postId } = req.params;

  const postIsExist = await checkPost(postId);
  if (!postIsExist) throw new RequestError("Post not found!", 404);
  if (postIsExist?.authorId !== Number((req as ExpressRequestExtended).userId))
    throw new RequestError("Access Denied", 403);

  return next();
};

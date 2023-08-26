import express from "express";
import Comment from "../models/comment";
import { RequestError } from "../lib/error";
import { ExpressRequestExtended } from "../types/request";

export const checkComment = async (commentId: string) => {
  const comment = await Comment.findUnique({
    where: { id: Number(commentId) },
  });

  if (!comment) throw new RequestError("Comment not found", 404);

  return comment;
};

export const getComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { commentId } = req.params;

  const comment = await Comment.findUnique({
    where: {
      id: Number(commentId),
    },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      user: { select: { id: true, username: true } },
      childrenComment: {
        select: {
          id: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
          childrenComment: {
            select: {
              id: true,
              comment: true,
              createdAt: true,
              user: { select: { id: true, username: true } },
            },
          },
        },
      },
    },
  });

  if (!comment) throw new RequestError("Comment not found!", 404);

  return res.status(200).json(comment);
};

export const deleteComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { commentId } = req.params;

  await Comment.delete({
    where: {
      id: Number(commentId),
    },
  });

  return res.status(204).json();
};

export const updateComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { comment } = req.body;
  const { commentId } = req.params;

  await Comment.update({
    where: {
      id: Number(commentId),
    },
    data: {
      comment,
    },
  });

  return res.status(204).json();
};

export const createComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { comment, postId, parentId } = req.body;
  await Comment.create({
    data: {
      userId: Number((req as ExpressRequestExtended).userId),
      comment,
      postId,
      parentId,
    },
  });

  return res.status(204).json();
};

export const createReplyComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;
  const { comment } = req.body;

  const currentComment = await checkComment(commentId);

  await Comment.create({
    data: {
      comment,
      parentId: Number(commentId),
      postId: currentComment.postId,
      userId: Number(userId),
    },
  });

  return res.status(204).json();
};

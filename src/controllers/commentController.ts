import express from "express";
import Comment from "../models/comment";
import { ExpressRequestExtended } from "../types/request";
import { findCommmentById } from "../utils/findComment";
import { getFileDest } from "../utils/getFileDest";
import Image from "../models/image";
import { jSuccess } from "../utils/jsend";
import { fieldsErrorTrigger } from "../lib/error";

export const getComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { commentId } = req.params;

  const comment = await findCommmentById(commentId);

  return res.status(200).json(jSuccess(comment));
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

  return res.status(204).json(jSuccess(null));
};

export const updateComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { comment } = req.body;
  const { commentId } = req.params;

  await findCommmentById(commentId);

  await Comment.update({
    where: {
      id: Number(commentId),
    },
    data: {
      comment,
    },
  });

  return res.status(204).json(jSuccess(null));
};

export const createComment = async (
  req: express.Request,
  res: express.Response
) => {
  const image = req.file;
  const { userId } = req as ExpressRequestExtended;
  const { comment, postId, parentId } = req.body;

  const createdComment = await Comment.create({
    data: {
      userId: Number(userId),
      comment,
      postId: Number(postId),
      parentId: Number(parentId),
    },
  });

  if (image) {
    await Image.create({
      data: {
        src: getFileDest(image) as string,
        commentId: createdComment.id,
      },
    });
  }

  return res.status(201).json(jSuccess(createdComment));
};

export const createReplyComment = async (
  req: express.Request,
  res: express.Response
) => {
  const image = req.file;
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;
  const { comment } = req.body;

  const currentComment = await findCommmentById(commentId);

  const createdComment = await Comment.create({
    data: {
      comment,
      parentId: Number(commentId),
      postId: Number(currentComment.postId),
      userId: Number(userId),
    },
  });

  if (image) {
    await Image.create({
      data: {
        src: getFileDest(image) as string,
        commentId: createdComment.id,
      },
    });
  }

  return res.status(201).json(jSuccess(createdComment));
};

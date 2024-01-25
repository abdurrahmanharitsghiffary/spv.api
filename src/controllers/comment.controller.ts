import express from "express";
import Comment, { createOneComment } from "../models/comment.models";
import { ExpressRequestExtended } from "../types/request";
import {
  findCommentById,
  checkCommentIsFound,
} from "../utils/comment/comment.utils";
import { ApiResponse } from "../utils/response";
import { checkPostIsFound } from "../utils/post/post.utils";
import { notify } from "../utils/notification/notification.utils";
import cloudinary, { getCloudinaryImage } from "../lib/cloudinary";

export const getComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;

  const comment = await findCommentById(Number(commentId), Number(userId));

  return res.status(200).json(new ApiResponse(comment, 200));
};

export const deleteComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { commentId } = req.params;

  const deletedComment = await Comment.delete({
    where: {
      id: Number(commentId),
    },
    include: {
      image: {
        select: { src: true },
      },
    },
  });

  if (deletedComment.image?.src) {
    await cloudinary.uploader.destroy(deletedComment.image.src);
  }

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Comment successfully deleted."));
};

export const updateComment = async (
  req: express.Request,
  res: express.Response
) => {
  const { comment } = req.body;
  const { commentId } = req.params;
  const cId = Number(commentId);

  await Comment.update({
    where: {
      id: cId,
    },
    data: {
      comment,
    },
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Comment successfully updated."));
};

export const createComment = async (
  req: express.Request,
  res: express.Response
) => {
  const image = getCloudinaryImage(req)?.[0];
  const { userId } = req as ExpressRequestExtended;

  const { comment, postId, parentId, imageSrc } = req.body as {
    comment: string;
    postId: number | string;
    parentId: number | string;
    imageSrc?: string;
  };

  const pId = Number(postId);
  const prId = Number(parentId);
  const uId = Number(userId);

  if (parentId) {
    await checkCommentIsFound({
      customMessage: {
        message: "Can't found comment with provided parentId",
        statusCode: 404,
      },
      commentId: prId,
      currentUserId: uId,
    });
  }

  await checkPostIsFound({
    customMessage: {
      message: "Can't found post with provided postId",
      statusCode: 404,
    },
    postId: pId,
    currentUserId: uId,
  });

  const result = await createOneComment({
    comment,
    postId: pId,
    userId: uId,
    image: imageSrc ? imageSrc : image,
    parentId: parentId || parentId === 0 ? prId : null,
  });

  await notify(req, {
    type: "comment",
    commentId: result.id,
    postId: result.postId,
    receiverId: result.post?.authorId!,
    userId: uId,
  });

  return res
    .status(201)
    .json(new ApiResponse(result, 201, "Comment successfully created."));
};

export const createReplyComment = async (
  req: express.Request,
  res: express.Response
) => {
  const image = getCloudinaryImage(req)?.[0];
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;
  const { comment, imageSrc } = req.body as {
    comment: string;
    imageSrc?: string;
  };
  const uId = Number(userId);
  const currentComment = await checkCommentIsFound({
    commentId: Number(commentId),
    currentUserId: uId,
  });

  const result = await createOneComment({
    comment,
    postId: currentComment.postId,
    userId: uId,
    image: imageSrc ? imageSrc : image,
    parentId: currentComment.id,
  });

  await notify(req, {
    type: "replying_comment",
    commentId: result.id,
    postId: result.postId,
    receiverId: result.post?.authorId!,
    userId: uId,
  });

  return res
    .status(201)
    .json(new ApiResponse(result, 201, "Comment successfully created."));
};

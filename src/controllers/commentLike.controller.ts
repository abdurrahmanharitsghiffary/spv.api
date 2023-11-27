import { CommentLike } from "../models/comment.models";
import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";
import { ApiResponse } from "../utils/response";
import {
  excludeBlockedUser,
  excludeBlockingUser,
  selectUserSimplified,
} from "../lib/query/user";
import { findCommentById } from "../utils/comment/comment.utils";

export const getCommentLikesByCommentId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;

  await findCommentById(Number(commentId), Number(userId));

  const likes = await CommentLike.findMany({
    where: {
      AND: [
        {
          user: {
            ...excludeBlockedUser(Number(userId)),
            ...excludeBlockingUser(Number(userId)),
          },
        },
      ],
      commentId: Number(commentId),
    },
    select: {
      userId: true,
      user: {
        select: selectUserSimplified,
      },
    },
  });

  const count = await CommentLike.count({
    where: {
      commentId: Number(commentId),
    },
  });

  const normalizedLikes = likes.map((like) => ({
    id: like.userId,
    firstName: like.user.firstName,
    lastName: like.user.lastName,
    username: like.user.username,
    profilePhoto: like.user.profile?.avatarImage,
  }));

  return res.status(200).json(
    new ApiResponse(
      {
        commentId: Number(commentId),
        likedBy: normalizedLikes,
        total: count,
      },
      200
    )
  );
};

export const createLike = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;

  await findCommentById(Number(commentId), Number(userId));

  const commentAlreadyExist = await CommentLike.findUnique({
    where: {
      userId_commentId: {
        userId: Number(userId),
        commentId: Number(commentId),
      },
    },
  });

  if (commentAlreadyExist)
    throw new RequestError("You already liked this comment", 409);

  const createdLike = await CommentLike.create({
    data: {
      userId: Number(userId),
      commentId: Number(commentId),
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(createdLike, 201, "Comment successfully liked."));
};

export const deleteLike = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;

  await CommentLike.delete({
    where: {
      userId_commentId: {
        userId: Number(userId),
        commentId: Number(commentId),
      },
    },
  });

  return res.status(204).json(new ApiResponse(null, 204));
};

export const getCommentIsLiked = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;

  const isLiked = await CommentLike.findUnique({
    where: {
      userId_commentId: {
        userId: Number(userId),
        commentId: Number(commentId),
      },
    },
  });

  return res.status(200).json(new ApiResponse(isLiked ? true : false, 200));
};

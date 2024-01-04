import Comment, { CommentLike } from "../models/comment.models";
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
import { NotFound } from "../lib/messages";
import { getPagingObject, parsePaging } from "../utils/paging";
import { UserSimplified } from "../types/user";
import { getCompleteFileUrlPath } from "../utils";
import { notify } from "../utils/notification/notification.utils";
// /continue
export const getCommentLikesByCommentId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;
  const { limit, offset } = parsePaging(req);
  const uId = Number(userId);
  const cId = Number(commentId);

  await findCommentById(cId, uId);

  const likes = await CommentLike.findMany({
    where: {
      AND: [
        {
          user: {
            ...excludeBlockedUser(uId),
            ...excludeBlockingUser(uId),
          },
        },
      ],
      commentId: cId,
    },
    select: {
      userId: true,
      user: {
        select: selectUserSimplified,
      },
    },
    take: limit,
    skip: offset,
  });

  const count = await CommentLike.count({
    where: {
      commentId: cId,
    },
  });

  const normalizedLikes = await Promise.all(
    likes.map((like) =>
      Promise.resolve({
        avatarImage: getCompleteFileUrlPath(like.user.profile?.avatarImage),
        firstName: like.user.firstName,
        fullName: like.user.fullName,
        id: like.userId,
        isOnline: like.user.isOnline,
        lastName: like.user.lastName,
        username: like.user.username,
      } as UserSimplified)
    )
  );

  return res.status(200).json(
    await getPagingObject({
      req,
      total_records: count,
      data: normalizedLikes,
    })
  );
};

export const createLike = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;
  const uId = Number(userId);
  const cId = Number(commentId);

  const comment = await findCommentById(cId, uId);

  const commentAlreadyExist = await CommentLike.findUnique({
    where: {
      userId_commentId: {
        userId: uId,
        commentId: cId,
      },
    },
  });

  if (commentAlreadyExist)
    throw new RequestError("You already liked this comment", 409);

  const createdLike = await CommentLike.create({
    data: {
      userId: uId,
      commentId: cId,
    },
  });

  await notify(req, {
    type: "liking_comment",
    commentId: comment.id,
    postId: comment.postId,
    receiverId: comment.user.id,
    userId: uId,
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
  const uId = Number(userId);
  const cId = Number(commentId);

  const comment = await Comment.findUnique({
    where: {
      id: cId,
    },
    select: {
      likes: {
        select: {
          userId: true,
        },
        where: {
          userId: uId,
        },
      },
    },
  });

  if (!comment) throw new RequestError(NotFound.COMMENT, 404);
  if (!comment.likes?.[0]?.userId) {
    throw new RequestError(
      "Failed to unlike comment, because you are not liking the comment",
      // NEED FIX CODE:STATUS_CODE
      400
    );
  }

  await CommentLike.delete({
    where: {
      userId_commentId: {
        userId: uId,
        commentId: cId,
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

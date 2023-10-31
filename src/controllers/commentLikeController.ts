import CommentLike from "../models/commentLike";
import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";
import { jSuccess } from "../utils/jsend";
import Comment from "../models/comment";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import { findCommentById } from "../utils/findComment";

export const getCommentLikesByCommentId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { commentId } = req.params;

  const comment = await Comment.findUnique({
    where: {
      id: Number(commentId),
      user: {
        ...excludeBlockedUser(Number(userId)),
        ...excludeBlockingUser(Number(userId)),
      },
      post: {
        author: {
          ...excludeBlockedUser(Number(userId)),
          ...excludeBlockingUser(Number(userId)),
        },
      },
    },
  });

  if (comment === null) throw new RequestError("Comment not found", 404);

  const likes = await CommentLike.findMany({
    where: {
      AND: [
        // {
        //   comment: {
        //     post: {
        //       author: {
        //         ...excludeBlockedUser(Number(userId)),
        //         ...excludeBlockingUser(Number(userId)),
        //       },
        //     },
        //   },
        // },
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
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          profile: {
            select: {
              avatarImage: {
                select: {
                  src: true,
                },
              },
            },
          },
        },
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
    jSuccess({
      commentId: Number(commentId),
      likedBy: normalizedLikes,
      total: count,
    })
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

  return res.status(201).json(jSuccess(createdLike));
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

  return res.status(204).json(jSuccess(null));
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

  return res.status(200).json(jSuccess(isLiked ? true : false));
};

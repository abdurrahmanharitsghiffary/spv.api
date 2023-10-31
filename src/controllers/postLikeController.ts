import PostLike from "../models/postLike";
import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";
import Post from "../models/post";
import { jSuccess } from "../utils/jsend";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";

export const getPostLikesByPostId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;

  const post = await Post.findUnique({
    where: {
      id: Number(postId),
      author: {
        ...excludeBlockedUser(Number(userId)),
        ...excludeBlockingUser(Number(userId)),
      },
    },
  });

  const likes = await PostLike.findMany({
    where: {
      postId: Number(postId),
      user: {
        ...excludeBlockedUser(Number(userId)),
        ...excludeBlockingUser(Number(userId)),
      },
    },
    select: {
      userId: true,
      postId: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
          username: true,
          profile: {
            select: {
              avatarImage: {
                select: {
                  id: true,
                  src: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const count = await PostLike.count({
    where: {
      postId: Number(postId),
    },
  });

  if (post === null) throw new RequestError("Post not found", 404);

  const normalizedLikes = likes.map((like) => ({
    id: like.userId,
    firstName: like.user.firstName,
    lastName: like.user.lastName,
    username: like.user.username,
    profilePhoto: like.user.profile?.avatarImage,
  }));

  return res.status(200).json(
    jSuccess({
      postId: Number(postId),
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
  const { postId } = req.params;

  const postAlreadyExist = await PostLike.findUnique({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });

  if (postAlreadyExist)
    throw new RequestError("You already liked this post", 409);

  const createdLike = await PostLike.create({
    data: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });

  return res.status(201).json(jSuccess(createdLike));
};

export const deleteLike = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;

  await PostLike.delete({
    where: {
      userId_postId: { userId: Number(userId), postId: Number(postId) },
    },
  });

  return res.status(204).json(jSuccess(null));
};
// NEED BLOCK FEATURE
export const getPostIsLiked = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;

  const isLiked = await PostLike.findFirst({
    where: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });

  return res.status(200).json(jSuccess(isLiked ? true : false));
};

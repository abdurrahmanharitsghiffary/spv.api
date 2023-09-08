import PostLike from "../models/postLike";
import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";
import Post from "../models/post";
import { jSuccess } from "../utils/jsend";

export const getPostLikesByPostId = async (
  req: express.Request,
  res: express.Response
) => {
  const { postId } = req.params;

  const post = await Post.findUnique({
    where: {
      id: Number(postId),
    },
  });

  const likes = await PostLike.findMany({
    where: {
      postId: Number(postId),
    },
    select: {
      userId: true,
      postId: true,
      user: {
        select: {
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

  if (post === null) throw new RequestError("Post not found", 404);

  const normalizedLikes = likes.map((like) => ({
    userId: like.userId,
    postId: like.postId,
    username: like.user.username,
    profilePhoto: like.user.profile?.avatarImage,
  }));

  return res
    .status(200)
    .json(jSuccess({ likedBy: normalizedLikes, total: likes.length }));
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

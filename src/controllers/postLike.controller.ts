import Post, { PostLike } from "../models/post.models";
import express from "express";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";
import { ApiResponse } from "../utils/response";
import {
  excludeBlockedUser,
  excludeBlockingUser,
  selectUserSimplified,
} from "../lib/query/user";
import { findPostById } from "../utils/post/post.utils";
import { findPostIsLiked } from "../utils/post/postLike.utils";
import { UserSimplified } from "../types/user";
import { getCompleteFileUrlPath } from "../utils";
import { getPagingObject, parsePaging } from "../utils/paging";
// CONTINUe
export const getPostLikesByPostId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;
  const { limit, offset } = parsePaging(req);
  await findPostById(postId, Number(userId));

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
          ...selectUserSimplified,
        },
      },
    },
    take: limit,
    skip: offset,
  });

  const count = await PostLike.count({
    where: {
      postId: Number(postId),
    },
  });

  const normalizedLikes = await Promise.all(
    likes.map((like) =>
      Promise.resolve({
        id: like.userId,
        firstName: like.user.firstName,
        lastName: like.user.lastName,
        username: like.user.username,
        avatarImage: getCompleteFileUrlPath(like.user.profile?.avatarImage),
        fullName: like.user.fullName,
        isOnline: like.user.isOnline,
      } as UserSimplified)
    )
  );

  return res
    .status(200)
    .json(
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
  const { postId } = req.params;
  const pId = Number(postId);
  const uId = Number(userId);

  const post = await findPostIsLiked(pId, uId);
  if (post.likes?.[0]?.userId)
    throw new RequestError("Post already liked", 409);

  const createdLike = await PostLike.create({
    data: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });

  return res.status(201).json(new ApiResponse(createdLike, 201));
};

export const deleteLike = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { postId } = req.params;
  const pId = Number(postId);
  const uId = Number(userId);

  const post = await findPostIsLiked(pId, uId);

  if (!post.likes?.[0]?.userId)
    throw new RequestError("Post is not liked.", 400);

  await PostLike.delete({
    where: {
      userId_postId: { userId: uId, postId: pId },
    },
  });

  return res.status(204).json(new ApiResponse(null, 204));
};

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

  return res.status(200).json(new ApiResponse(isLiked ? true : false, 200));
};

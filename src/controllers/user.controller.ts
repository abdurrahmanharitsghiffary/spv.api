import express from "express";
import User from "../models/user.models";
import Profile from "../models/profile.models";
import {
  findAllUser,
  findUserById,
  findUserPublic,
} from "../utils/user/user.utils";
import { getPagingObject } from "../utils/paging";
import { ApiResponse } from "../utils/response";
import { findPostsByAuthorId } from "../utils/post/post.utils";
import { ExpressRequestExtended } from "../types/request";

export const getUser = async (req: express.Request, res: express.Response) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  const { userId } = req.params;
  const user = await findUserPublic(userId, Number(currentUserId));

  return res.status(200).json(new ApiResponse(user, 200));
};

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  let { limit = 20, offset = 0 } = req.query;
  limit = Number(limit);
  offset = Number(offset);
  const users = await findAllUser({ limit, offset });

  return res.status(200).json(
    await getPagingObject({
      data: users.data,
      total_records: users.total,
      req,
    })
  );
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  await findUserById(Number(userId));

  await User.delete({ where: { id: Number(userId) } });
  return res
    .status(204)
    .json(new ApiResponse(null, 204, "User successfully deleted."));
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  const { username, description } = req.body;

  await findUserById(Number(userId));

  const user = await User.update({
    where: {
      id: Number(userId),
    },
    data: {
      username,
    },
  });

  await Profile.upsert({
    where: {
      userId: user.email,
    },
    update: {
      profileDescription: description,
    },
    create: {
      userId: user.email,
    },
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "User successfully updated."));
};

export const getPostByUserId = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  let { offset = 0, limit = 20 } = req.query;
  const { userId } = req.params;

  offset = Number(offset);
  limit = Number(limit);

  const posts = await findPostsByAuthorId({
    authorId: Number(userId),
    limit,
    offset,
    currentUserId: Number(currentUserId),
  });

  return res.status(200).json(
    await getPagingObject({
      data: posts.data,
      total_records: posts.total,
      req,
    })
  );
};

export const getUserIsFollowed = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: uId } = req.params;
  const { userId } = req as ExpressRequestExtended;
  const isFollowed = await User.findUnique({
    where: {
      id: Number(uId),
      followedBy: {
        some: {
          id: Number(userId),
        },
      },
    },
  });

  return res.status(200).json(new ApiResponse(isFollowed ? true : false, 200));
};

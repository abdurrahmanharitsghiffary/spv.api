import express from "express";
import User from "../models/user";
import Profile from "../models/profile";
import { findAllUser, findUserById, findUserPublic } from "../utils/findUser";
import { getPagingObject } from "../utils/getPagingObject";
import { jSuccess } from "../utils/jsend";
import { findPostsByAuthorId } from "../utils/findPost";
import { ExpressRequestExtended } from "../types/request";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";

export const getUser = async (req: express.Request, res: express.Response) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  const { userId } = req.params;
  const user = await findUserPublic(userId, Number(currentUserId));

  return res.status(200).json(jSuccess(user));
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
    getPagingObject({
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
  await findUserById(userId);

  await User.delete({ where: { id: Number(userId) } });
  return res.status(204).json(jSuccess(null));
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  const { username, description } = req.body;

  await findUserById(userId);

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

  return res.status(204).json(jSuccess(null));
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
    getPagingObject({
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
      ...excludeBlockedUser(Number(userId)),
      ...excludeBlockingUser(Number(userId)),
      id: Number(uId),
      followedBy: {
        some: {
          id: Number(userId),
        },
      },
    },
  });

  return res.status(200).json(jSuccess(isFollowed ? true : false));
};

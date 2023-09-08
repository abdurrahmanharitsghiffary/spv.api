import express from "express";
import { ExpressRequestExtended } from "../types/request";
import {
  findFollowUserByUserEmail,
  findFollowUserByUserId,
  findUserById,
} from "../utils/findUser";
import User from "../models/user";
import { RequestError } from "../lib/error";
import { jSuccess } from "../utils/jsend";

export const getFollowedUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  const followedUserIds = await findFollowUserByUserEmail(
    userEmail,
    "following"
  );

  return res.status(200).json(
    jSuccess({
      followedUserIds: followedUserIds.following,
      // @ts-ignore
      total: followedUserIds.total.following,
    })
  );
};

export const getMyFollowers = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  const followerIds = await findFollowUserByUserEmail(userEmail, "followedBy");

  return res.status(200).json(
    jSuccess({
      followerIds: followerIds.followedBy,
      // @ts-ignore
      total: followerIds.total.followedBy,
    })
  );
};

export const createFollowUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: loggedUserId } = req as ExpressRequestExtended;

  const { userId } = req.body;

  if (loggedUserId === userId)
    throw new RequestError("Can't follow yourself", 400);

  const createdFollow = await User.update({
    where: {
      id: Number(loggedUserId),
    },
    data: {
      following: {
        connect: {
          id: Number(userId),
        },
      },
    },
    select: {
      id: true,
      username: true,
    },
  });

  return res.status(201).json(jSuccess(createdFollow));
};

export const deleteFollow = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;
  const { followId } = req.params;

  await findUserById(followId);

  await User.update({
    where: {
      email: userEmail,
    },
    data: {
      following: {
        disconnect: {
          id: Number(followId),
        },
      },
    },
  });

  return res.status(204).json(jSuccess(null));
};

export const getUserFollowersById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  const userFollowers = await findFollowUserByUserId(userId, "followedBy");

  return res.status(200).json(
    jSuccess({
      userId: Number(userId),
      followerIds: userFollowers.followedBy,
      // @ts-ignore
      total: userFollowers.total.followedBy,
    })
  );
};

export const getFollowedUsersById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  const userFollowers = await findFollowUserByUserId(userId, "following");

  return res.status(200).json(
    jSuccess({
      userId: Number(userId),
      followedUserIds: userFollowers.following,
      // @ts-ignore
      total: userFollowers.total.following,
    })
  );
};

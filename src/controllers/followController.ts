import express from "express";
import { ExpressRequestExtended } from "../types/request";
import {
  findFollowUserByUserEmail,
  findFollowUserByUserId,
  findUserById,
  findUserPublic,
} from "../utils/findUser";
import User from "../models/user";
import { RequestError } from "../lib/error";
import { jSuccess } from "../utils/jsend";

export const getFollowedUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail, userId } = req as ExpressRequestExtended;

  const followedUserIds = await findFollowUserByUserEmail(
    userEmail,
    "following",
    Number(userId)
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
  const { userEmail, userId } = req as ExpressRequestExtended;

  const followerIds = await findFollowUserByUserEmail(
    userEmail,
    "followedBy",
    Number(userId)
  );

  return res.status(200).json(
    jSuccess({
      followerIds: followerIds.followedBy,
      // @ts-ignore
      total: followerIds.total.followedBy,
    })
  );
};

export const getUserFollowersById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  const { userId } = req.params;
  const userFollowers = await findFollowUserByUserId(
    userId,
    "followedBy",
    Number(currentUserId)
  );

  return res.status(200).json(
    jSuccess({
      userId: Number(userId),
      followers: userFollowers.followedBy,
      // @ts-ignore
      total: userFollowers.total.followedBy,
    })
  );
};

export const getFollowedUsersById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  const { userId } = req.params;
  const userFollowers = await findFollowUserByUserId(
    userId,
    "following",
    Number(currentUserId)
  );

  return res.status(200).json(
    jSuccess({
      userId: Number(userId),
      followedUsers: userFollowers.following,
      // @ts-ignore
      total: userFollowers.total.following,
    })
  );
};

export const followUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;

  const { userId } = req.body;

  if (currentUserId === userId)
    throw new RequestError("Can't follow yourself", 400);

  await findUserPublic(userId, Number(currentUserId));

  const createdFollow = await User.update({
    where: {
      id: Number(currentUserId),
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

export const unfollowUser = async (
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

import express from "express";
import { ExpressRequestExtended } from "../types/request";
import {
  findFollowUserByUserEmail,
  findFollowUserByUserId,
  findUserById,
  findUserPublic,
} from "../utils/user/user.utils";
import User from "../models/user.models";
import { RequestError } from "../lib/error";
import { ApiResponse } from "../utils/response";

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
    new ApiResponse(
      {
        followedUserIds: followedUserIds.following,
        // @ts-ignore
        total: followedUserIds.total.following,
      },
      200
    )
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
    new ApiResponse(
      {
        followerIds: followerIds.followedBy,
        // @ts-ignore
        total: followerIds.total.followedBy,
      },
      200
    )
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
    new ApiResponse(
      {
        userId: Number(userId),
        followers: userFollowers.followedBy,
        // @ts-ignore
        total: userFollowers.total.followedBy,
      },
      200
    )
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
    new ApiResponse(
      {
        userId: Number(userId),
        followedUsers: userFollowers.following,
        // @ts-ignore
        total: userFollowers.total.following,
      },
      200
    )
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

  return res
    .status(201)
    .json(new ApiResponse(createdFollow, 201, "User successfully followed."));
};

export const unfollowUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;
  const { followId } = req.params;

  await findUserById(Number(followId));

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

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Successfully unfollow user."));
};

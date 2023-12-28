import express from "express";
import { ExpressRequestExtended } from "../types/request";
import {
  findFollowUserByUserId,
  findUserPublic,
} from "../utils/user/user.utils";
import User from "../models/user.models";
import { RequestError } from "../lib/error";
import { ApiResponse } from "../utils/response";
import { excludeBlockedUser, excludeBlockingUser } from "../lib/query/user";
import { NotFound } from "../lib/messages";
import { getPagingObject, parsePaging } from "../utils/paging";

export const getFollowedUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { limit, offset } = parsePaging(req);
  const followedUsers = await findFollowUserByUserId({
    types: "following",
    userId,
    limit,
    offset,
  });

  return res.status(200).json(
    await getPagingObject({
      req,
      total_records: followedUsers.total,
      data: followedUsers.data,
    })
  );
};

export const getMyFollowers = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  const { limit, offset } = parsePaging(req);
  const followers = await findFollowUserByUserId({
    types: "followedBy",
    userId,
    limit,
    offset,
  });

  return res
    .status(200)
    .json(
      await getPagingObject({
        req,
        data: followers.data,
        total_records: followers.total,
      })
    );
};

export const getUserFollowersById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  let { limit = 20, offset = 0 } = req.query;
  limit = Number(limit);
  offset = Number(offset);
  const { userId } = req.params;
  const userFollowers = await findFollowUserByUserId({
    userId,
    types: "followedBy",
    currentUserId: Number(currentUserId),
    limit,
    offset,
  });

  return res.status(200).json(
    await getPagingObject({
      req,
      total_records: userFollowers.total,
      data: userFollowers.data,
    })
  );
};

export const getFollowedUsersById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  let { limit = 20, offset = 0 } = req.query;
  limit = Number(limit);
  offset = Number(offset);
  const { userId } = req.params;

  const userFollowers = await findFollowUserByUserId({
    userId,
    types: "following",
    currentUserId: Number(currentUserId),
    limit,
    offset,
  });

  return res.status(200).json(
    await getPagingObject({
      req,
      total_records: userFollowers.total,
      data: userFollowers.data,
    })
  );
};

export const followUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  const { userId } = req.body;
  const CUID = Number(currentUserId);
  const uId = Number(userId);

  if (CUID === uId) throw new RequestError("Can't follow yourself", 400);

  await findUserPublic(uId as any, CUID);
  const user = await User.findUnique({
    where: {
      id: CUID,
    },
    select: {
      following: {
        select: { id: true },
        where: {
          id: uId,
        },
      },
    },
  });

  const userAlreadyFollowed = user?.following?.[0]?.id ? true : false;

  if (userAlreadyFollowed) {
    throw new RequestError("User already followed.", 409);
  }

  const createdFollow = await User.update({
    where: {
      id: CUID,
    },
    data: {
      following: {
        connect: {
          id: uId,
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
  const { userId } = req as ExpressRequestExtended;
  const { followId } = req.params;
  const fId = Number(followId);
  const cId = Number(userId);

  const user = await User.findUnique({
    where: {
      id: fId,
      AND: [
        {
          ...excludeBlockingUser(cId),
          ...excludeBlockedUser(cId),
        },
      ],
    },
    select: {
      followedBy: {
        select: { id: true },
        where: { id: cId },
      },
    },
  });

  if (!user) throw new RequestError(NotFound.USER, 404);
  const isUserAlreadyFollowed = user?.followedBy?.[0]?.id ? true : false;

  if (!isUserAlreadyFollowed)
    throw new RequestError("User is not followed", 400);

  await User.update({
    where: {
      id: fId,
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

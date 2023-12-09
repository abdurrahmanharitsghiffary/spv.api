import express from "express";
import User from "../models/user.models";
import { ExpressRequestExtended } from "../types/request";
import { ApiResponse } from "../utils/response";
import { RequestError } from "../lib/error";
import {
  findUserById,
  getUserIsFollowed,
  userSelectPublicInput,
} from "../utils/user/user.utils";
import { selectUser, selectUserPublic } from "../lib/query/user";
import { getPagingObject } from "../utils/paging";
import { normalizeUserPublic } from "../utils/user/user.normalize";
import { NotFound } from "../lib/messages";

export const getAllBlockedUsers = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  let { limit = 20, offset = 0 } = req.query;
  const uId = Number(userId);
  limit = Number(limit);
  offset = Number(offset);
  const user = await User.findUnique({
    where: {
      id: uId,
    },
    select: {
      ...selectUser,
      blocked: {
        select: userSelectPublicInput(uId),
        take: limit,
        skip: offset,
        orderBy: [{ username: "asc" }, { firstName: "asc" }],
      },
      _count: {
        select: { ...selectUserPublic._count.select, blocked: true },
      },
    },
  });

  res.status(200).json(
    await getPagingObject({
      data: await Promise.all(
        (user?.blocked ?? []).map((user) => {
          const isFollowed = getUserIsFollowed(user, uId);
          return Promise.resolve(normalizeUserPublic(user, isFollowed));
        })
      ),
      req,
      total_records: user?._count.blocked ?? 0,
    })
  );
};

export const blockUserById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  const { userId } = req.body;
  const uId = Number(userId);
  const CUID = Number(currentUserId);

  if (uId === CUID) throw new RequestError("Cannot block yourself.", 400);

  await findUserById(uId, CUID);

  const result = await User.update({
    where: {
      id: CUID,
    },
    data: {
      blocked: {
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

  return res.status(201).json(new ApiResponse(result, 201));
};

export const unblockUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: currentUserId } = req as ExpressRequestExtended;
  const { userId } = req.params;
  const CUID = Number(currentUserId);
  const uId = Number(userId);

  const user = await User.findUnique({
    where: {
      id: uId,
    },
    select: {
      blocking: {
        select: { id: true },
        where: {
          id: CUID,
        },
      },
    },
  });

  if (!user) throw new RequestError(NotFound.USER, 404);
  const isUserBlockedByUs = user?.blocking?.[0]?.id ? true : false;

  if (!isUserBlockedByUs) throw new RequestError("User is not blocked.", 400);

  await User.update({
    where: {
      id: CUID,
    },
    data: {
      blocked: {
        disconnect: {
          id: uId,
        },
      },
    },
  });

  return res.status(204).json(new ApiResponse(null, 204));
};

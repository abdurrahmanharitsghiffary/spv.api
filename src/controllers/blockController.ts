import express from "express";
import User from "../models/user";
import { ExpressRequestExtended } from "../types/request";
import { jSuccess } from "../utils/jsend";
import { RequestError } from "../lib/error";
import { findUserById, userSelectPublicInput } from "../utils/findUser";
import { selectUser, selectUserPublic } from "../lib/query/user";
import { getPagingObject } from "../utils/getPagingObject";
import { normalizeUserPublic } from "../utils/normalizeUser";

export const getAllBlockedUsers = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;
  let { limit = 20, offset = 0 } = req.query;
  limit = Number(limit);
  offset = Number(offset);
  const user = await User.findUnique({
    where: {
      id: Number(userId),
    },
    select: {
      ...selectUser,
      blocked: {
        select: userSelectPublicInput(Number(userId)),
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
    getPagingObject({
      data: (user?.blocked ?? []).map((user) => normalizeUserPublic(user)),
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

  if (Number(userId) === Number(currentUserId))
    throw new RequestError("You cannot block yourself.", 400);

  const result = await User.update({
    where: {
      id: Number(currentUserId),
    },
    data: {
      blocked: {
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

  return res.status(201).json(jSuccess(result));
};

export const unblockUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: loggedUserId } = req as ExpressRequestExtended;
  const { userId } = req.params;

  await findUserById(userId);

  await User.update({
    where: {
      id: Number(loggedUserId),
    },
    data: {
      blocked: {
        disconnect: {
          id: Number(userId),
        },
      },
    },
  });

  return res.status(204).json(jSuccess(null));
};

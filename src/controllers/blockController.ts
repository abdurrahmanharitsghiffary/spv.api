import express from "express";
import User from "../models/user";
import { ExpressRequestExtended } from "../types/request";
import { jSuccess } from "../utils/jsend";
import { RequestError } from "../lib/error";

export const blockUserById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: loggedUserId } = req as ExpressRequestExtended;
  const { userId } = req.body;

  if (Number(userId) === Number(loggedUserId))
    throw new RequestError("You cannot block yourself.", 400);

  await User.update({
    where: {
      id: Number(loggedUserId),
    },
    data: {
      blocked: {
        connect: {
          id: Number(userId),
        },
      },
    },
  });

  return res.status(201).json(jSuccess(null));
};

export const removeBlockedUserById = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId: loggedUserId } = req as ExpressRequestExtended;
  const { userId } = req.params;

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

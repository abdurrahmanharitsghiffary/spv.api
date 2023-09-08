import express from "express";
import User from "../models/user";
import Profile from "../models/profile";
import { findAllUser, findUserById, findUserPublic } from "../utils/findUser";
import { baseUrl } from "../lib/baseUrl";
import { getPagingObject } from "../utils/getPagingObject";
import { jSuccess } from "../utils/jsend";

export const getUser = async (req: express.Request, res: express.Response) => {
  const { userId } = req.params;
  const user = await findUserPublic(userId);

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
      current: `${baseUrl}${req.originalUrl}`,
      total_records: users.total,
      limit,
      offset,
      path: `${baseUrl}/api/users`,
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

import express from "express";
import User from "../models/user";
import { RequestError } from "../lib/error";
import Profile from "../models/profile";
import { findAllUser, findUserById, findUserPublic } from "../utils/findUser";

const checkUser = async (userId: string) => {
  const user = await User.findUnique({ where: { id: Number(userId) } });
  if (user) return true;
  return false;
};

export const getUser = async (req: express.Request, res: express.Response) => {
  const { userId } = req.params;
  const user = await findUserPublic(userId);

  return res.status(200).json(user);
};

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  const users = await findAllUser();

  return res.status(200).json(users);
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  const isUserExists = await checkUser(userId);

  if (!isUserExists) throw new RequestError("User not found!", 404);

  await User.delete({ where: { id: Number(userId) } });
  return res.status(204).json();
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.params;
  const { username, image, description } = req.body;

  const isUserExists = await checkUser(userId);

  if (!isUserExists) throw new RequestError("User not found!", 404);

  const user = await User.update({
    where: {
      id: Number(userId),
    },
    data: {
      username,
    },
  });

  await Profile.update({
    where: {
      userId: user.email,
    },
    data: {
      profileDescription: description,
      image,
    },
  });

  return res.status(204).json();
};

// BY EMAIL?

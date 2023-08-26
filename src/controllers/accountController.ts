import express from "express";
import User from "../models/user";
import { RequestError } from "../lib/error";
import { findUser } from "../utils/findUser";
import { ExpressRequestExtended } from "../types/request";

export const getMyAccountInfo = async (
  req: express.Request,
  res: express.Response
) => {
  const myAccount = await findUser((req as ExpressRequestExtended)?.userEmail);

  if (!myAccount) throw new RequestError("Something went wrong!", 500);

  return res.status(200).json(myAccount);
};

export const updateMyAccount = async (
  req: express.Request,
  res: express.Response
) => {
  const { username, email, description } = req.body;

  await User.update({
    where: {
      email: (req as ExpressRequestExtended).userEmail,
    },
    data: {
      username,
      email,
      profile: {
        update: {
          profileDescription: description,
        },
      },
    },
  });

  return res.status(204).json();
};

export const deleteMyAccount = async (
  req: express.Request,
  res: express.Response
) => {
  await User.delete({
    where: {
      email: (req as ExpressRequestExtended).userEmail,
    },
  });

  return res.status(204).json();
};

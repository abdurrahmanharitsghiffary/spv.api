import express from "express";
import { jSuccess } from "../utils/jsend";
import User from "../models/user";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";

export const deleteGoogleAccount = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;

  const user = await User.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (user?.googleId === null || user?.provider === null)
    throw new RequestError("Email is not google associated account.", 403);
  if (!user) throw new RequestError("Something went wrong!", 400);

  await User.delete({
    where: {
      id: Number(userId),
      provider: "GOOGLE",
      googleId: user.googleId,
    },
  });

  res.clearCookie("x.spv.session", {
    sameSite: "strict",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });
  return res.status(203).json(jSuccess(null));
};

import express from "express";
import User from "../models/user";
import { findUser } from "../utils/findUser";
import { ExpressRequestExtended } from "../types/request";
import { getFileDest } from "../utils/getFileDest";
import Image from "../models/image";
import { RequestError } from "../lib/error";
import { deleteUploadedImage } from "../utils/deleteUploadedImage";

export const updateProfileImage = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  const image = req.file;
  if (image) {
    await User.update({
      where: {
        email: userEmail,
      },
      data: {
        profile: {
          update: {
            avatarImage: {
              create: {
                src: getFileDest(image) as string,
              },
            },
          },
        },
      },
    });
  }

  return res.status(204).json();
};

export const getMyAccountInfo = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  const myAccount = await findUser(userEmail);

  return res.status(200).json(myAccount);
};

export const updateMyAccount = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  const { username, description } = req.body;

  await User.update({
    where: {
      email: userEmail,
    },
    data: {
      username,
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
  const { userEmail } = req as ExpressRequestExtended;

  await User.delete({
    where: {
      email: userEmail,
    },
  });

  return res.status(204).json();
};

export const deleteAccountImage = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  const user = await User.findUnique({
    where: {
      email: userEmail,
    },
    include: {
      profile: {
        include: {
          avatarImage: true,
        },
      },
    },
  });

  if (!user?.profile?.avatarImage)
    throw new RequestError("Profile image not found", 404);

  await Image.delete({
    where: {
      profileId: user.profile.id,
    },
  });

  await deleteUploadedImage(user.profile.avatarImage.src);

  return res.status(403).json();
};

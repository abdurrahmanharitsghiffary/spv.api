import express from "express";
import User from "../models/user";
import { findUser } from "../utils/findUser";
import { ExpressRequestExtended } from "../types/request";
import { getFileDest } from "../utils/getFileDest";
import Image from "../models/image";
import { RequestError, fieldsErrorTrigger } from "../lib/error";
import { deleteUploadedImage } from "../utils/deleteUploadedImage";
import Token from "../models/token";
import { getRandomToken } from "../utils/getRandomToken";
import { sendVerifyEmail } from "../utils/sendEmail";
import { baseUrl } from "../lib/baseUrl";
import { jSuccess } from "../utils/jsend";

export const updateProfileImage = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  let src: string | undefined;
  const image = req.file;
  fieldsErrorTrigger([{ field: image, key: "image", type: "skip" }]);
  if (image) {
    const profileImage = await User.findUnique({
      where: { email: userEmail },
      select: {
        profile: {
          select: {
            avatarImage: {
              select: {
                src: true,
              },
            },
          },
        },
      },
    });

    src = profileImage?.profile?.avatarImage?.src;

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

    if (src) await deleteUploadedImage(src);
  }

  return res.status(204).json(jSuccess(null));
};

export const getMyAccountInfo = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  const myAccount = await findUser(userEmail);

  return res.status(200).json(jSuccess(myAccount));
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

  return res.status(204).json(jSuccess(null));
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

  return res.status(204).json(jSuccess(null));
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

  return res.status(204).json(jSuccess(null));
};

export const verifyAccount = async (
  req: express.Request,
  res: express.Response
) => {
  const { verifyToken } = req.params;

  const token = await Token.findUnique({
    where: {
      AND: {
        type: "verify_token",
      },
      token: verifyToken,
    },
    include: {
      user: true,
    },
  });

  if (!token) throw new RequestError("Invalid Token", 401);

  await Token.deleteMany({
    where: {
      userEmail: token?.userEmail,
      type: "verify_token",
    },
  });

  if (token?.user.verified)
    throw new RequestError("Email is already verified", 409);

  if (token.expires_in.getTime() < Date.now())
    throw new RequestError("Token expired", 401);

  await User.update({
    where: {
      email: token.userEmail,
    },
    data: { verified: true },
  });

  return res.status(204).json(jSuccess(null));
};

export const sendVerifyToken = async (
  req: express.Request,
  res: express.Response
) => {
  const { email } = req.body;

  const user = await User.findUnique({
    where: {
      email,
    },
  });

  const token = await getRandomToken();

  if (user && !user.verified) {
    await Token.create({
      data: {
        type: "verify_token",
        expires_in: new Date(Date.now() + 300 * 1000),
        token,
        userEmail: email,
      },
    });

    await sendVerifyEmail(email, `${baseUrl}/api/verify/${token}`);
  }

  res.status(200).json(
    jSuccess({
      message: `If a matching account was found & email is valid, an email was sent to ${email} to verify your email.`,
    })
  );
};

import express from "express";
import User from "../models/user";
import { findUser } from "../utils/findUser";
import { ExpressRequestExtended } from "../types/request";
import { getFileDest } from "../utils/getFileDest";
import Image from "../models/image";
import { RequestError } from "../lib/error";
import { deleteUploadedImage } from "../utils/deleteUploadedImage";
import Token from "../models/token";
import { getRandomToken } from "../utils/getRandomToken";
import { sendVerifyEmail } from "../utils/sendEmail";
import { jSuccess } from "../utils/jsend";
import * as bcrypt from "bcrypt";
import CoverImage from "../models/coverImage";

export const getMyAccountInfo = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;

  const myAccount = await findUser(Number(userId));

  return res.status(200).json(jSuccess(myAccount));
};

export const updateAccountImage = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, userEmail } = req as ExpressRequestExtended;
  const { type = "profile" } = req.query;

  let src: string | undefined;
  const image = req.file;
  const user = await findUser(Number(userId));
  if (!user) throw new RequestError("Something went wrong!", 404);
  if (type === "profile") {
    if (image) {
      src = user?.profile?.image?.src;

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
  } else {
    if (image) {
      src = user?.profile?.coverImage?.src;

      await User.update({
        where: {
          email: userEmail,
        },
        data: {
          profile: {
            update: {
              coverImage: {
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
  }

  return res.status(204).json(jSuccess(null));
};

export const updateMyAccount = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;

  const { username, description, firstName, lastName, gender, birthDate } =
    req.body;

  await User.update({
    where: {
      email: userEmail,
    },
    data: {
      username,
      firstName,
      lastName,
      profile: {
        update: {
          gender,
          birthDate,
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
  const { currentPassword } = req.body;

  const user = await User.findUnique({ where: { email: userEmail } });
  if (!user) throw new RequestError("Something went wrong!", 400);
  const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
  if (!isMatch)
    throw new RequestError("Incorrect password. Please try again.", 400);

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
  const { type = "profile" } = req.query;

  const user = await User.findUnique({
    where: {
      email: userEmail,
    },
    include: {
      profile: {
        include: {
          avatarImage: true,
          coverImage: true,
        },
      },
    },
  });

  if (!user) throw new RequestError("Something went wrong!", 400);

  if (type === "profile") {
    if (!user?.profile?.avatarImage)
      throw new RequestError("Profile image not found", 404);

    if (user.profile)
      await Image.delete({
        where: {
          profileId: user.profile.id,
        },
      });

    await deleteUploadedImage(user.profile.avatarImage.src);
  } else {
    if (!user?.profile?.coverImage)
      throw new RequestError("Profile image not found", 404);

    if (user.profile)
      await CoverImage.delete({
        where: {
          profileId: user.profile.id,
        },
      });

    await deleteUploadedImage(user.profile.coverImage.src);
  }

  return res.status(204).json(jSuccess(null));
};

export const changeMyAccountPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;
  const { currentPassword, password } = req.body;

  const user = await User.findUnique({
    where: { email: userEmail },
  });

  if (!user) throw new RequestError("Something went wrong!", 400);
  const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);

  if (!isMatch)
    throw new RequestError("Incorrect password. Please try again", 400);

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT)
  );

  await User.update({
    where: {
      email: userEmail,
    },
    data: {
      hashedPassword,
    },
  });

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

  return res.status(200).json(
    jSuccess({
      message: "Email verification successful. Your account has been verified.",
    })
  );
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

    await sendVerifyEmail(email, `http://localhost:3000/verify/${token}`);
  }

  res.status(200).json(
    jSuccess({
      message: `If a matching account was found & email is valid, an email was sent to ${email} to verify your email.`,
    })
  );
};

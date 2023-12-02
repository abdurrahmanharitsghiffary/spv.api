import express from "express";
import User from "../models/user.models";
import { findUserById } from "../utils/user/user.utils";
import { ExpressRequestExtended } from "../types/request";
import { getFileDest } from "../utils";
import Image from "../models/image.models";
import { RequestError } from "../lib/error";
import { deleteUploadedImage } from "../utils";
import Token from "../models/token.models";
import { getRandomToken } from "../utils";
import { sendVerifyEmail } from "../utils/email.utils";
import { ApiResponse } from "../utils/response";
import * as bcrypt from "bcrypt";
import { CoverImage } from "../models/image.models";
import { BCRYPT_SALT } from "../lib/consts";

export const getMyAccountInfo = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req as ExpressRequestExtended;

  const myAccount = await findUserById(Number(userId));

  return res.status(200).json(new ApiResponse(myAccount, 200));
};

export const updateAccountImage = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId, userEmail } = req as ExpressRequestExtended;
  const { type = "profile" } = req.query;

  let src: string | undefined;
  const image = req.file;

  const user = await findUserById(Number(userId));

  if (!user) throw new RequestError("Something went wrong!", 404);
  if (type === "profile") {
    if (image) {
      src = user?.profile?.avatarImage?.src;

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

  return res
    .status(204)
    .json(
      new ApiResponse(null, 204, `User ${type} image successfully updated.`)
    );
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

  return res
    .status(204)
    .json(
      new ApiResponse(null, 204, "Account informations successfully updated.")
    );
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

  res.clearCookie("x.spv.session", {
    sameSite: "strict",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });

  const deletedUser = await User.delete({
    where: {
      email: userEmail,
    },
    include: {
      profile: {
        include: {
          avatarImage: { select: { src: true } },
          coverImage: { select: { src: true } },
        },
      },
    },
  });

  if (deletedUser.profile?.coverImage?.src) {
    await deleteUploadedImage(deletedUser.profile.coverImage.src);
  }

  if (deletedUser.profile?.avatarImage?.src) {
    await deleteUploadedImage(deletedUser.profile.avatarImage.src);
  }

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Account successfully deleted."));
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

  return res
    .status(204)
    .json(new ApiResponse(null, 204, `${type} image successfully deleted.`));
};

export const changeMyAccountPassword = async (
  req: express.Request,
  res: express.Response
) => {
  const { userEmail } = req as ExpressRequestExtended;
  const { currentPassword, password } = req.body;

  const user = await User.findUnique({
    where: {
      email: userEmail,
      provider: {
        equals: null,
      },
    },
  });

  if (!user) throw new RequestError("Something went wrong!", 400);
  const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);

  if (!isMatch)
    throw new RequestError("Incorrect password. Please try again", 400);

  const hashedPassword = await bcrypt.hash(password, Number(BCRYPT_SALT));

  await User.update({
    where: {
      email: userEmail,
    },
    data: {
      hashedPassword,
    },
  });

  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Password successfully changed"));
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

  return res
    .status(200)
    .json(
      new ApiResponse(
        null,
        200,
        "Email verification successful. Your account has been verified."
      )
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

  res
    .status(200)
    .json(
      new ApiResponse(
        null,
        200,
        `If a matching account was found & email is valid, an email was sent to ${email} to verify your email.`
      )
    );
};

import express from "express";
import User from "../models/user";
import { RequestError } from "../lib/error";
import bcrypt from "bcrypt";
import { tryCatch } from "../middlewares/tryCatch";
import { jSuccess } from "../utils/jsend";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { ExpressRequestExtended } from "../types/request";

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  const user = await User.findUnique({
    where: {
      email,
    },
    include: {
      profile: {
        include: {
          avatarImage: true,
        },
      },
      refreshToken: true,
    },
  });

  if (!user) throw new RequestError("Invalid Credentials", 401);

  const passwordIsMatch = await bcrypt.compare(password, user.hashedPassword);

  if (!passwordIsMatch) throw new RequestError("Invalid Credentials", 401);

  const access_token = await generateAccessToken({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email,
    username: user.username,
  });

  const refresh_token = await generateRefreshToken({
    id: user.id,
    email,
    lastName: user.lastName,
    firstName: user.firstName,
    username: user.username,
  });

  // await RefreshToken.upsert({
  //   where: {
  //     refreshToken: user.refreshToken?.refreshToken,
  //     userId: user.id,
  //   },
  //   create: {
  //     refreshToken: refresh_token,
  //     userId: user.id,
  //   },
  //   update: {
  //     userId: user.id,
  //     refreshToken: refresh_token,
  //   },
  // });

  res.cookie("x.spv.session", refresh_token, {
    sameSite: "strict",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });

  return res.status(200).json(
    jSuccess({
      access_token,
      token_type: "Bearer",
      expires_in: 3600,
    })
  );
};

export const signUp = async (req: express.Request, res: express.Response) => {
  const { email, password, username, firstName, lastName } = req.body;

  const isUserExists = await User.findUnique({
    where: { email },
  });

  if (isUserExists) throw new RequestError("User already exists!", 409);

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT)
  );

  const user = await User.create({
    data: {
      firstName,
      lastName,
      email,
      hashedPassword,
      username,
      profile: { create: { profileDescription: null } },
      // refreshToken: {
      //   create: {
      //     refreshToken: refresh_token,
      //   },
      // },
    },
  });

  const refresh_token = await generateRefreshToken({
    id: user.id,
    firstName,
    lastName,
    email,
    username,
  });

  const access_token = await generateAccessToken({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email,
    username,
  });

  res.cookie("x.spv.session", refresh_token, {
    sameSite: "strict",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });

  return res.status(201).json(
    jSuccess({
      access_token,
      token_type: "Bearer",
      expires_in: 3600,
    })
  );
};

export const refreshToken = tryCatch(
  async (req: express.Request, res: express.Response) => {
    const { userEmail } = req as ExpressRequestExtended;

    const user = await User.findUnique({
      where: {
        email: userEmail,
      },
    });

    const access_token = await generateAccessToken({
      firstName: user?.firstName,
      lastName: user?.lastName,
      id: user?.id,
      username: user?.username,
      email: user?.email,
    });

    return res.status(200).json(
      jSuccess({
        access_token,
        expires_in: 3600,
      })
    );
  }
);

export const signOut = async (req: express.Request, res: express.Response) => {
  const token = req.cookies["x.spv.session"];
  console.log(token, " refresh-token");
  console.log(req.cookies);
  console.log(req.signedCookies);

  if (!token) throw new RequestError("You are unauthenticated!", 401);

  // await RefreshToken.delete({
  //   where: {
  //     refreshToken: token,
  //   },
  // });
  res.clearCookie("x.spv.session", {
    sameSite: "strict",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });
  return res.status(204).json(jSuccess(null));
};

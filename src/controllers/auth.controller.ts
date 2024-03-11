import express from "express";
import User from "../models/user.models";
import { RequestError } from "../lib/error";
import bcrypt from "bcrypt";
import { tryCatch } from "../middlewares/handler.middlewares";
import { ApiResponse } from "../utils/response";
import {
  generateAccessToken,
  generateRefreshToken,
  getFullName,
} from "../utils";
import { ExpressRequestExtended } from "../types/request";
import { BCRYPT_SALT } from "../lib/consts";

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  const user = await User.findUnique({
    where: {
      email,
      provider: {
        equals: null,
      },
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
    fullName: user.fullName,
    email,
    username: user.username,
  });

  const refresh_token = await generateRefreshToken({
    id: user.id,
    email,
    lastName: user.lastName,
    fullName: user.fullName,
    firstName: user.firstName,
    username: user.username,
  });

  res.cookie("x.spv.session", refresh_token, {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });

  return res.status(200).json(
    new ApiResponse(
      {
        access_token,
        token_type: "Bearer",
        expires_in: 3600,
      },
      200,
      "Login successfull."
    )
  );
};

export const signUp = async (req: express.Request, res: express.Response) => {
  const { email, password, username, firstName, lastName, birthDate, gender } =
    req.body;

  const isUserExists = await User.findUnique({
    where: { email },
  });

  if (isUserExists) throw new RequestError("Email already registered.", 409);

  const hashedPassword = await bcrypt.hash(password, Number(BCRYPT_SALT));

  const user = await User.create({
    data: {
      firstName,
      lastName,
      fullName: getFullName(firstName, lastName),
      email,
      hashedPassword,
      username,
      profile: { create: { profileDescription: null, birthDate, gender } },
    },
  });

  const refresh_token = await generateRefreshToken({
    id: user.id,
    firstName,
    fullName: user.fullName,
    lastName,
    email,
    username,
  });

  const access_token = await generateAccessToken({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email,
    username,
  });

  res.cookie("x.spv.session", refresh_token, {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });

  return res.status(201).json(
    new ApiResponse(
      {
        access_token,
        token_type: "Bearer",
        expires_in: 3600,
      },
      201,
      "User successfully registered."
    )
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
      fullName: user?.fullName,
      username: user?.username,
      email: user?.email,
    });

    return res.status(200).json(
      new ApiResponse(
        {
          access_token,
          expires_in: 3600,
        },
        200
      )
    );
  }
);

export const signOut = async (req: express.Request, res: express.Response) => {
  const token = req.cookies["x.spv.session"];

  if (!token) throw new RequestError("You are unauthenticated!", 401);

  res.clearCookie("x.spv.session", {
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });
  return res.status(200).json(new ApiResponse(null, 200, "Logout success."));
};

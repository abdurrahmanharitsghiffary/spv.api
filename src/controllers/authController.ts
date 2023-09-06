import express from "express";
import User from "../models/user";
import { RequestError } from "../lib/error";
import bcrypt from "bcrypt";
import JWT, { JwtPayload } from "jsonwebtoken";
import { tryCatch } from "../middlewares/tryCatch";
import RefreshToken from "../models/refreshToken";

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
      refreshToken: {
        select: {
          id: true,
          refreshToken: true,
        },
      },
    },
  });

  if (!user) throw new RequestError("Invalid Credentials", 401);

  const passwordIsMatch = await bcrypt.compare(password, user.hashedPassword);

  if (!passwordIsMatch) throw new RequestError("Invalid Credentials", 401);

  const access_token = await JWT.sign(
    {
      id: user.id,
      email,
      image: user.profile?.avatarImage,
      username: user.username,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: 3600,
    }
  );

  const refresh_token = await JWT.sign(
    {
      id: user.id,
      email,
      username: user.username,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  await RefreshToken.upsert({
    where: {
      refreshToken: user.refreshToken?.refreshToken,
      userId: user.id,
    },
    create: {
      refreshToken: refresh_token,
      userId: user.id,
    },
    update: {
      userId: user.id,
      refreshToken: refresh_token,
    },
  });

  return res.status(200).json({
    access_token,
    refresh_token,
    token_type: "Bearer",
    expires_in: 3600,
  });
};

export const signUp = async (req: express.Request, res: express.Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username)
    throw new RequestError("Missing required fields!", 400);

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
      email,
      hashedPassword,
      username,
      profile: { create: { profileDescription: null } },
    },
  });

  const access_token = await JWT.sign(
    {
      id: user.id,
      email,
      username,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: 3600,
    }
  );

  const refresh_token = await JWT.sign(
    {
      id: user.id,
      email,
      username: user.username,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  await RefreshToken.create({
    data: {
      userId: user.id,
      refreshToken: refresh_token,
    },
  });

  return res.status(201).json({
    access_token,
    refresh_token,
    token_type: "Bearer",
    expires_in: 3600,
  });
};

export const refreshToken = tryCatch(
  async (req: express.Request, res: express.Response) => {
    const token = req.headers.authorization;
    const refreshToken =
      token && token.includes("Basic") ? token.split(" ")[1] : "";

    if (!refreshToken) throw new RequestError("No token provided!", 401);

    const tokenIsExist = await RefreshToken.findUnique({
      where: {
        refreshToken,
      },
    });

    if (!tokenIsExist) throw new RequestError("Invalid refresh token", 401);

    const decodedToken = await JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    const user = await User.findUnique({
      where: {
        email: (decodedToken as JwtPayload).email,
      },
    });

    const access_token = await JWT.sign(
      { id: user?.id, username: user?.username, email: user?.email },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: 3600 }
    );

    return res.status(200).json({
      access_token,
      expires_in: 3600,
    });
  }
);

export const signOut = async (req: express.Request, res: express.Response) => {
  const token = req.headers.authorization;
  const refreshToken =
    token && token.includes("Basic") ? token.split(" ")[1] : "";

  await RefreshToken.delete({
    where: {
      refreshToken,
    },
  });

  return res.status(204).json();
};

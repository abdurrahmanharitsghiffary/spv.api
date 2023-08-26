import express from "express";
import User from "../models/user";
import { RequestError } from "../lib/error";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

export const signIn = async (req: express.Request, res: express.Response) => {
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
    },
  });

  if (!user) throw new RequestError("Invalid Credentials", 401);

  const passwordIsMatch = await bcrypt.compare(password, user.hashedPassword);

  if (!passwordIsMatch) throw new RequestError("Invalid Credentials", 401);

  const token = await JWT.sign(
    {
      id: user.id,
      email,
      image: user.profile,
      username: user.username,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: 3600,
    }
  );

  return res.status(200).json({
    id: user.id,
    email: user.email,
    username: user.username,
    image: user.profile?.avatarImage,
    token,
  });
};

export const signUp = async (req: express.Request, res: express.Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username)
    throw new RequestError("Missing required fields!", 400);
  console.log("not pass");
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

  const token = await JWT.sign(
    {
      id: user.id,
      email,
      username,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: 3600,
    }
  );

  return res.status(201).json({
    id: user.id,
    token,
    email,
    username,
  });
};

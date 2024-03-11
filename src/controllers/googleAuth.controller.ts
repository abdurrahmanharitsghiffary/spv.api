import express from "express";
import { ApiResponse } from "../utils/response";
import User from "../models/user.models";
import { ExpressRequestExtended } from "../types/request";
import { RequestError } from "../lib/error";
import { generateRefreshToken, getFullName } from "../utils";
import { BASE_CLIENT_URL } from "../lib/consts";

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
    sameSite: "none",
    secure: true,
    httpOnly: true,
    maxAge: 60000 * 60 * 24 * 7,
  });
  return res
    .status(204)
    .json(new ApiResponse(null, 204, "Account successfully deleted."));
};

interface UserJson {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export const googleAuthCallback = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const userJson: UserJson = (req?.user as any)?._json ?? {};

    let user = await User.findUnique({
      where: {
        googleId: userJson.sub,
      },
    });
    const given_name = userJson?.given_name;
    const family_name = userJson?.family_name;
    if (!user) {
      const newUser = await User.create({
        data: {
          verified: true,
          email: userJson?.email,
          firstName: given_name,
          lastName: family_name,
          fullName: getFullName(given_name, family_name),
          hashedPassword: "",
          provider: "GOOGLE",
          profile: {
            create: {
              avatarImage: {
                create: {
                  src: userJson?.picture,
                },
              },
            },
          },
          username: userJson?.email?.split("@")[0],
          googleId: userJson?.sub,
        },
      });

      user = newUser;
    }

    const refresh_token = await generateRefreshToken({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
    });

    res.cookie("x.spv.session", refresh_token, {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      maxAge: 60000 * 60 * 24 * 7,
    });

    res.redirect(BASE_CLIENT_URL!);
  } catch (err: any) {
    const message = err?.message?.includes(
      "Unique constraint failed on the constraint: `users_email_key`"
    )
      ? "Email already registered."
      : "";
    res.redirect(`${BASE_CLIENT_URL}/login?err_message=${message}`);
  }
};

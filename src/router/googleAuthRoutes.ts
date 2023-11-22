import express from "express";
import passport from "passport";
import User from "../models/user";
import { generateRefreshToken } from "../utils/generateToken";
import { jSuccess } from "../utils/jsend";
import { tryCatch } from "../middlewares/tryCatch";
import { deleteGoogleAccount } from "../controllers/googleAuthController";
import { validate } from "../middlewares/validate";
import { z } from "zod";
import { verifyToken } from "../middlewares/auth";

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

const router = express.Router();

router
  .route("/")
  .get(
    passport.authenticate("google", {
      failureMessage: "Sign in failed",
      scope: ["profile", "email"],
      session: false,
    })
  )
  .delete(verifyToken, tryCatch(deleteGoogleAccount));

router.get(
  "/callback",
  passport.authenticate("google", {
    failureMessage: "Sign in failed",
    session: false,
  }),
  async function (req, res) {
    try {
      const userJson: UserJson = (req?.user as any)?._json ?? {};

      let user = await User.findUnique({
        where: {
          googleId: userJson.sub,
        },
      });

      if (!user) {
        const newUser = await User.create({
          data: {
            verified: userJson?.email_verified ?? false,
            email: userJson?.email,
            firstName: userJson?.given_name,
            lastName: userJson?.family_name,
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
            username:
              userJson?.name?.split(" ").join("").toLowerCase() +
              `${new Date(Date.now()).getMilliseconds()}`.slice(0, 2),
            googleId: userJson?.sub,
          },
        });

        user = newUser;
      }
      console.log(user);
      // const access_token = await generateAccessToken({
      //   id: user.id,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   fullName: user.fullName,
      //   email: user.email,
      //   username: user.username,
      // });

      const refresh_token = await generateRefreshToken({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
      });

      res.cookie("x.spv.session", refresh_token, {
        sameSite: "strict",
        secure: true,
        httpOnly: true,
        maxAge: 60000 * 60 * 24 * 7,
      });

      res.redirect("http://localhost:3000");

      // return res.status(200).json(
      //   jSuccess({
      //     access_token,
      //     token_type: "Bearer",
      //     expires_in: 3600,
      //   })
      // );
    } catch (err: any) {
      console.log(err?.message, " Error login");
      const message = err?.message?.includes(
        "Unique constraint failed on the constraint: `users_email_key`"
      )
        ? "Email already registered."
        : "";
      res.redirect(`http://localhost:3000/login?err_message=${message}`);
    }
    console.log("callback route");
  }
);

export default router;

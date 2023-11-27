import express from "express";
import passport from "passport";
import { tryCatch } from "../middlewares/handler.middlewares";
import {
  deleteGoogleAccount,
  googleAuthCallback,
} from "../controllers/googleAuth.controller";
import { verifyToken } from "../middlewares/auth.middlewares";

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
  googleAuthCallback
);

export default router;

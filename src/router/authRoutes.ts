import express from "express";
import { tryCatch } from "../middlewares/tryCatch";
import { login, signOut, signUp } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import {
  userValidationSignInSchema,
  userValidationSignUpSchema,
} from "../schema/user";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter";

const router = express.Router();

router
  .route("/login")
  .post(loginLimiter, validate(userValidationSignInSchema), tryCatch(login));
router
  .route("/signup")
  .post(
    registerLimiter,
    validate(userValidationSignUpSchema),
    tryCatch(signUp)
  );
router.route("/logout").post(tryCatch(signOut));

export default router;

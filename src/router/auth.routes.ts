import express from "express";
import { tryCatch } from "../middlewares/handler.middlewares";
import { login, signOut, signUp } from "../controllers/auth.controller";
import { validate } from "../middlewares/validator.middlewares";
import {
  userValidationSignInSchema,
  userValidationSignUpSchema,
} from "../schema/user.schema";
import {
  loginLimiter,
  registerLimiter,
} from "../middlewares/limiter.middlewares";

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

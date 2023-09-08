import express from "express";
import { tryCatch } from "../middlewares/tryCatch";
import { login, signOut, signUp } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import {
  userValidationSignInSchema,
  userValidationSignUpSchema,
} from "../schema/userValidationSchema";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter";
import {
  sanitizeLogin,
  sanitizeSignUp,
} from "../middlewares/validation/sanitizeAuth";

const router = express.Router();

router.route("/login").post(
  loginLimiter,
  // sanitizeLogin,
  validate(userValidationSignInSchema),
  tryCatch(login)
);
router.route("/signup").post(
  registerLimiter,
  // sanitizeSignUp,
  validate(userValidationSignUpSchema),
  tryCatch(signUp)
);
router.route("/logout").delete(tryCatch(signOut));

export default router;

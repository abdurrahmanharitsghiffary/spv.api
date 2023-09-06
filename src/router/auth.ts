import express from "express";
import { tryCatch } from "../middlewares/tryCatch";
import { login, signOut, signUp } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import {
  userValidationSignInSchema,
  userValidationSignUpSchema,
} from "../schema/userValidationSchema";

const router = express.Router();

router
  .route("/login")
  .post(validate(userValidationSignInSchema), tryCatch(login));
router
  .route("/signup")
  .post(validate(userValidationSignUpSchema), tryCatch(signUp));
router.route("/logout").delete(tryCatch(signOut));

export default router;

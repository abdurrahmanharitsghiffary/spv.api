import express from "express";
import { tryCatch } from "../middlewares/tryCatch";
import { login, register } from "../controllers/authController";
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
  .route("/register")
  .post(validate(userValidationSignUpSchema), tryCatch(register));

export default router;

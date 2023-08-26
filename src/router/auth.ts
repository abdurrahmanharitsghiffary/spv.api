import express from "express";
import { tryCatch } from "../middlewares/tryCatch";
import { signIn, signUp } from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { userValidationSchema } from "../schema/userValidationSchema";

const router = express.Router();

router.route("/signin").post(tryCatch(signIn));
router.route("/signup").post(validate(userValidationSchema), tryCatch(signUp));

export default router;

import express from "express";
import {
  resetPassword,
  sendResetToken,
} from "../controllers/resetPasswordController";
import { tryCatch } from "../middlewares/tryCatch";
import { validate } from "../middlewares/validate";
import { emailRequestValidation } from "../schema/validationSchema";
import {
  sendVerifyToken,
  verifyAccount,
} from "../controllers/accountController";

const router = express.Router();

router
  .route("/resetpassword")
  .post(validate(emailRequestValidation), tryCatch(sendResetToken));
router.route("/resetpassword/:token").post(tryCatch(resetPassword));
router
  .route("/verify")
  .post(validate(emailRequestValidation), tryCatch(sendVerifyToken));
router.route("/verify/:verifyToken").post(tryCatch(verifyAccount));

export default router;

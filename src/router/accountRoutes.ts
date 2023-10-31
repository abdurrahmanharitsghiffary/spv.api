import express from "express";
import {
  resetPassword,
  sendResetToken,
} from "../controllers/resetPasswordController";
import { tryCatch } from "../middlewares/tryCatch";
import { validate } from "../middlewares/validate";
import { emailRequestValidation } from "../schema/emailRequest";
import {
  sendVerifyToken,
  verifyAccount,
} from "../controllers/accountController";
import {
  resetPasswordLimiter,
  verifyLimiter,
} from "../middlewares/rateLimiter";

const router = express.Router();

router
  .route("/resetpassword")
  .post(
    resetPasswordLimiter,
    validate(emailRequestValidation),
    tryCatch(sendResetToken)
  );
router.route("/resetpassword/:token").post(tryCatch(resetPassword));
router
  .route("/verify")
  .post(
    verifyLimiter,
    validate(emailRequestValidation),
    tryCatch(sendVerifyToken)
  );
router.route("/verify/:verifyToken").post(tryCatch(verifyAccount));

export default router;

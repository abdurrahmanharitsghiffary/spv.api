import express from "express";
import {
  resetPassword,
  sendResetToken,
} from "../controllers/resetPassword.controller";
import { tryCatch } from "../middlewares/handler.middlewares";
import { validate } from "../middlewares/validator.middlewares";
import { emailRequestValidation } from "../schema";
import {
  sendVerifyToken,
  verifyAccount,
} from "../controllers/account.controller";
import {
  resetPasswordLimiter,
  verifyLimiter,
} from "../middlewares/limiter.middlewares";

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

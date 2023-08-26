import express from "express";
import {
  deleteMyAccount,
  getMyAccountInfo,
  updateMyAccount,
} from "../controllers/accountController";
import { tryCatch } from "../middlewares/tryCatch";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

router.use(verifyToken);

router
  .route("/me")
  .get(tryCatch(getMyAccountInfo))
  .patch(tryCatch(updateMyAccount))
  .delete(tryCatch(deleteMyAccount));

export default router;

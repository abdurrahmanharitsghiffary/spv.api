import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/userController";
import { tryCatch } from "../middlewares/tryCatch";
import { verifyToken, isAdmin } from "../middlewares/auth";

const router = express.Router();

router.use(verifyToken);

router.route("/").get(isAdmin, tryCatch(getAllUsers));
router
  .route("/:userId")
  .get(tryCatch(getUser))
  .patch(isAdmin, tryCatch(updateUser))
  .delete(isAdmin, deleteUser);

export default router;

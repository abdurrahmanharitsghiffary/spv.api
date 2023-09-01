import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/userController";
import { tryCatch } from "../middlewares/tryCatch";
import { verifyToken, isAdmin } from "../middlewares/auth";
import {
  getFollowedUsersById,
  getUserFollowersById,
} from "../controllers/followController";

const router = express.Router();

router.route("/").get(verifyToken, isAdmin, tryCatch(getAllUsers));
router
  .route("/:userId")
  .get(tryCatch(getUser))
  .patch(verifyToken, isAdmin, tryCatch(updateUser))
  .delete(verifyToken, isAdmin, tryCatch(deleteUser));
router.route("/:userId/following").get(tryCatch(getFollowedUsersById));
router.route("/:userId/followers").get(tryCatch(getUserFollowersById));

export default router;

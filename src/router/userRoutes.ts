import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  getUserIsFollowed,
  updateUser,
} from "../controllers/userController";
import { tryCatch } from "../middlewares/tryCatch";
import { verifyToken, isAdmin } from "../middlewares/auth";
import {
  getFollowedUsersById,
  getUserFollowersById,
} from "../controllers/followController";
import { getPostByUserId } from "../controllers/userController";
import { isUserBlockOrBlocked_Params } from "../middlewares/userBlock";
import { validateBody, validateParamsV2 } from "../middlewares/validate";
import { z } from "zod";
import { zText, zUsername } from "../schema";
// DONE
const router = express.Router();
router.use(verifyToken);

router.route("/").get(isAdmin, tryCatch(getAllUsers));

router
  .route("/:userId")
  .get(isUserBlockOrBlocked_Params("userId"), tryCatch(getUser))
  .patch(
    validateBody(
      z.object({
        username: zUsername.optional(),
        description: zText.optional(),
      })
    ),
    isAdmin,
    tryCatch(updateUser)
  )
  .delete(validateParamsV2("userId"), isAdmin, tryCatch(deleteUser));
router
  .route("/:userId/following")
  .get(isUserBlockOrBlocked_Params("userId"), tryCatch(getFollowedUsersById));
router
  .route("/:userId/followers")
  .get(isUserBlockOrBlocked_Params("userId"), tryCatch(getUserFollowersById));

router
  .route("/:userId/isfollowed")
  .get(isUserBlockOrBlocked_Params("userId"), tryCatch(getUserIsFollowed));

router
  .route("/:userId/posts")
  .get(isUserBlockOrBlocked_Params("userId"), tryCatch(getPostByUserId));

export default router;

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
import { isUserBlockOrBlocked_Params } from "../middlewares/block";
import {
  validate,
  validatePagingOptions,
  validateParamsV2,
} from "../middlewares/validate";
import { z } from "zod";
import { zIntOrStringId, zLimit, zOffset, zText, zUsername } from "../schema";
import { getAllBlockedUsers } from "../controllers/blockController";

const router = express.Router();
router.use(verifyToken);

router.route("/").get(isAdmin, validatePagingOptions, tryCatch(getAllUsers));

router
  .route("/blocked")
  .get(validatePagingOptions, tryCatch(getAllBlockedUsers));

router
  .route("/:userId")
  .get(validateParamsV2("userId"), tryCatch(getUser))
  .patch(
    isAdmin,
    validate(
      z.object({
        body: z.object({
          username: zUsername.optional(),
          description: zText.optional(),
        }),
        params: z.object({
          userId: zIntOrStringId,
        }),
      })
    ),
    tryCatch(updateUser)
  )
  .delete(isAdmin, validateParamsV2("userId"), tryCatch(deleteUser));
router
  .route("/:userId/following")
  .get(validateParamsV2("userId"), tryCatch(getFollowedUsersById));
router
  .route("/:userId/followers")
  .get(validateParamsV2("userId"), tryCatch(getUserFollowersById));

router
  .route("/:userId/followed")
  .get(validateParamsV2("userId"), tryCatch(getUserIsFollowed));

router.route("/:userId/posts").get(
  validate(
    z.object({
      params: z.object({
        userId: zIntOrStringId,
      }),
      query: z.object({
        limit: zLimit,
        offset: zOffset,
      }),
    })
  ),
  tryCatch(getPostByUserId)
);

export default router;

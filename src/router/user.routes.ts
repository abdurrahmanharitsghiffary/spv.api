import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  getUserIsFollowed,
  updateUser,
} from "../controllers/user.controller";
import { tryCatch } from "../middlewares/handler.middlewares";
import { verifyToken, isAdmin } from "../middlewares/auth.middlewares";
import {
  getFollowedUsersById,
  getUserFollowersById,
} from "../controllers/follow.controller";
import { getPostByUserId } from "../controllers/user.controller";
import {
  validate,
  validateParamsV2,
} from "../middlewares/validator.middlewares";
import { z } from "zod";
import { zIntOrStringId, zText, zUsername } from "../schema";
import { getAllBlockedUsers } from "../controllers/block.controller";

const router = express.Router();
router.use(verifyToken);

router.route("/").get(isAdmin, tryCatch(getAllUsers));

router.route("/blocked").get(tryCatch(getAllBlockedUsers));

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
    })
  ),
  tryCatch(getPostByUserId)
);

export default router;

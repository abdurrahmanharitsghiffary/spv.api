import express from "express";
import {
  createUser,
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
  validateBody,
  validatePagingOptions,
  validateParamsV2,
} from "../middlewares/validator.middlewares";
import { z } from "zod";
import { zIntOrStringId, zLimit, zOffset, zText, zUsername } from "../schema";
import { getAllBlockedUsers } from "../controllers/block.controller";
import { createUserSchema, updateUserSchema } from "../schema/user.schema";
import { uploadImageV2 } from "../middlewares/multer.middlewares";
import { uploadFilesToCloudinary } from "../middlewares/cloudinary.middleware";

const router = express.Router();
router.use(verifyToken);

const validateFExtended = validate(
  z.object({
    params: z.object({
      userId: zIntOrStringId,
    }),
    query: z.object({
      limit: zLimit,
      offset: zOffset,
    }),
  })
);

router
  .route("/")
  .get(isAdmin, validatePagingOptions, tryCatch(getAllUsers))
  .post(
    isAdmin,
    uploadImageV2.fields([
      { name: "profile", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ]),
    uploadFilesToCloudinary,
    validateBody(createUserSchema),
    tryCatch(createUser)
  );

router
  .route("/blocked")
  .get(validatePagingOptions, tryCatch(getAllBlockedUsers));

router
  .route("/:userId")
  .get(validateParamsV2("userId"), tryCatch(getUser))
  .patch(
    isAdmin,
    uploadImageV2.fields([
      { name: "profile", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ]),
    uploadFilesToCloudinary,
    validate(
      z.object({
        body: updateUserSchema,
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
  .get(validateFExtended, tryCatch(getFollowedUsersById));
router
  .route("/:userId/followers")
  .get(validateFExtended, tryCatch(getUserFollowersById));

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

import express from "express";
import {
  changeMyAccountPassword,
  deleteAccountImage,
  deleteMyAccount,
  getMyAccountInfo,
  updateAccountImage,
  updateMyAccount,
} from "../controllers/accountController";
import { tryCatch } from "../middlewares/tryCatch";
import { verifyToken } from "../middlewares/auth";
import {
  deleteSavedPost,
  getAllMyPosts,
  getPostIsSaved,
  getSavedPosts,
  savePost,
} from "../controllers/postController";
import {
  getFollowedUser,
  getMyFollowers,
  createFollowUser,
  deleteFollow,
} from "../controllers/followController";
import { uploadImage } from "../utils/uploadImage";
import { getAllChatsByUserId } from "../controllers/chatController";
import {
  clearNotifications,
  createNotification,
  getAllUserNotifications,
} from "../controllers/notificationControllers";
import {
  blockUserById,
  removeBlockedUserById,
} from "../controllers/blockController";
import {
  validate,
  validateBody,
  validateParamsV2,
} from "../middlewares/validate";
import { z } from "zod";
import {
  zFirstName,
  zIntId,
  zLastName,
  zPassword,
  zProfileImageType,
  zText,
  zUsername,
} from "../schema";

const router = express.Router();

router.use(verifyToken);

router
  .route("/account")
  .get(tryCatch(getMyAccountInfo))
  .patch(
    validateBody(
      z.object({
        username: zUsername.optional(),
        description: z.string().min(1).optional(),
        firstName: zFirstName.optional(),
        lastName: zLastName.optional(),
      })
    ),
    tryCatch(updateMyAccount)
  )
  .delete(
    validateBody(
      z.object({
        currentPassword: zPassword("currentPassword"),
      })
    ),
    tryCatch(deleteMyAccount)
  );

router.route("/account/changepassword").patch(
  validate(
    z.object({
      body: z
        .object({
          currentPassword: zPassword("currentPassword"),
          password: zPassword(),
          confirmPassword: zPassword("confirmPassword"),
        })
        .refine(
          (arg) => {
            if (arg.confirmPassword !== arg.password) return false;
            return true;
          },
          {
            message: "The password and confirm password do not match.",
            path: ["confirmPassword"],
          }
        ),
    })
  ),
  tryCatch(changeMyAccountPassword)
);

router
  .route("/account/images")
  .delete(tryCatch(deleteAccountImage))
  .patch(
    uploadImage.single("image"),
    validate(
      z.object({
        query: z.object({
          type: zProfileImageType.optional(),
        }),
      })
    ),
    tryCatch(updateAccountImage)
  );

router
  .route("/posts/saved")
  .get(tryCatch(getSavedPosts))
  .post(
    validateBody(
      z.object({
        postId: zIntId("postId"),
      })
    ),
    tryCatch(savePost)
  );
router.route("/chats").get(tryCatch(getAllChatsByUserId));
router.route("/posts").get(tryCatch(getAllMyPosts));
router.route("/follow").post(
  validateBody(
    z.object({
      userId: zIntId("userId"),
    })
  ),
  tryCatch(createFollowUser)
);
router.route("/block").post(
  validateBody(
    z.object({
      userId: zIntId("userId"),
    })
  ),
  tryCatch(blockUserById)
);
router.route("/following").get(tryCatch(getFollowedUser));
router.route("/followers").get(tryCatch(getMyFollowers));
router
  .route("/notifications")
  .get(tryCatch(getAllUserNotifications))
  .delete(tryCatch(clearNotifications))
  .post(
    validateBody(
      z.object({
        title: zText,
        type: z.enum(["follow", "post", "like", "comment"]),
        content: zText,
        url: zText.optional(),
      })
    ),
    tryCatch(createNotification)
  );

router
  .route("/posts/saved/:postId")
  .delete(validateParamsV2("postId"), tryCatch(deleteSavedPost));
router.route("/posts/saved/:postId/isfollowed").get(tryCatch(getPostIsSaved));

router
  .route("/block/:userId")
  .delete(validateParamsV2("userId"), tryCatch(removeBlockedUserById));
router
  .route("/follow/:followId")
  .delete(validateParamsV2("followId"), tryCatch(deleteFollow));

export default router;

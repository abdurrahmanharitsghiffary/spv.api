import express from "express";
import {
  changeMyAccountPassword,
  deleteAccountImage,
  deleteMyAccount,
  getMyAccountInfo,
  updateAccountImage,
  updateMyAccount,
} from "../controllers/account.controller";
import { tryCatch } from "../middlewares/handler.middlewares";
import { verifyToken } from "../middlewares/auth.middlewares";
import {
  deleteSavedPost,
  getAllMyPosts,
  getPostIsSaved,
  getSavedPosts,
  savePost,
} from "../controllers/post.controller";
import {
  getFollowedUser,
  getMyFollowers,
  followUser,
  unfollowUser,
} from "../controllers/follow.controller";
import { uploadImageV2 } from "../middlewares/multer.middlewares";
import { getAllChatsByUserId } from "../controllers/chat.controller";
import {
  clearNotifications,
  getAllUserNotifications,
  readNotifications,
} from "../controllers/notification.controllers";
import { blockUserById, unblockUser } from "../controllers/block.controller";
import {
  validate,
  validateBody,
  validatePagingOptions,
  validateParamsV2,
} from "../middlewares/validator.middlewares";
import { string, z } from "zod";
import {
  zBirthDate,
  zFirstName,
  zGender,
  zIntId,
  zLastName,
  zLimit,
  zOffset,
  zPassword,
  zProfileImageType,
  zUsername,
} from "../schema";
import { uploadFilesToCloudinary } from "../middlewares/cloudinary.middleware";
import {
  deleteMembershipRequest,
  getGroupMembershipRequestById,
  getMembershipRequests,
} from "../controllers/groupChat.controllers";

const router = express.Router();

router.use(verifyToken);

router.route("/membership-requests").get(
  validatePagingOptions,
  validate(
    z.object({
      query: z.object({
        type: z.enum(["all", "pending", "approved", "rejected"]).optional(),
      }),
    })
  ),
  tryCatch(getMembershipRequests)
);

router
  .route("/account")
  .get(tryCatch(getMyAccountInfo))
  .patch(
    validateBody(
      z.object({
        username: zUsername.optional(),
        description: z.string().optional(),
        firstName: zFirstName.optional(),
        lastName: zLastName.optional(),
        gender: zGender.optional(),
        birthDate: zBirthDate.optional(),
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
  .delete(
    validate(
      z.object({
        query: z.object({
          type: zProfileImageType.optional(),
        }),
      })
    ),
    tryCatch(deleteAccountImage)
  )
  .patch(
    uploadImageV2.single("image"),
    uploadFilesToCloudinary,
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
  .get(validatePagingOptions, tryCatch(getSavedPosts))
  .post(
    validateBody(
      z.object({
        postId: zIntId("postId"),
      })
    ),
    tryCatch(savePost)
  );
router.route("/chats").get(
  validate(
    z.object({
      query: z.object({
        limit: zLimit,
        offset: zOffset,
        type: z.enum(["group", "all", "personal"]).optional(),
        q: string().optional(),
      }),
    })
  ),
  tryCatch(getAllChatsByUserId)
);
router.route("/posts").get(validatePagingOptions, tryCatch(getAllMyPosts));
router.route("/follow").post(
  validateBody(
    z.object({
      userId: zIntId("userId"),
    })
  ),
  tryCatch(followUser)
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
  .get(
    validate(
      z.object({
        query: z.object({
          limit: zLimit,
          offset: zOffset,
          order_by: z.enum(["latest", "oldest"]).optional(),
        }),
      })
    ),
    tryCatch(getAllUserNotifications)
  )
  .delete(
    validate(
      z.object({
        query: z.object({
          before_timestamp: z
            .any()
            .refine(
              (arg) => {
                if (!Number.isNaN(Number(arg))) return true;
                if (["y", "d", "h"].some((t) => arg.endsWith(t))) return true;
                return false;
              },
              {
                message:
                  "Invalid before_timestamp query options, query options must be a number of ms or a number value followed by: h (hours), d (day), y (year). example value: 1h, 2d, 1y, 60000.",
              }
            )
            .optional(),
        }),
      })
    ),
    tryCatch(clearNotifications)
  );

router.route("/notifications/read").post(
  validate(
    z.object({
      body: z.object({
        ids: z.any().refine(
          (arg) => {
            if (arg === "all") return true;
            if (
              arg instanceof Array &&
              arg.every((a) => typeof a === "number" && !isNaN(a))
            )
              return true;
          },
          {
            message:
              "Invalid ids value, ids must be string 'all' or array containing the notification ids",
          }
        ),
      }),
    })
  ),
  tryCatch(readNotifications)
);

router
  .route("/membership-requests/:requestId")
  .get(validateParamsV2("requestId"), tryCatch(getGroupMembershipRequestById))
  .delete(tryCatch(deleteMembershipRequest));

router
  .route("/posts/saved/:postId")
  .delete(validateParamsV2("postId"), tryCatch(deleteSavedPost));
router
  .route("/posts/saved/:postId/bookmarked")
  .get(validateParamsV2("postId"), tryCatch(getPostIsSaved));

router
  .route("/block/:userId")
  .delete(validateParamsV2("userId"), tryCatch(unblockUser));
router
  .route("/follow/:followId")
  .delete(validateParamsV2("followId"), tryCatch(unfollowUser));

export default router;

// .post(
//   validateBody(
//     z
//       .object({
//         type: zNotificationType,
//         postId: zIntId("postId").optional(),
//         commentId: zIntId("commentId").optional(),
//         receiverId: zIntId("receiverId"),
//       })
//       .refine(
//         (arg) => {
//           if (
//             (arg.type === "comment" || arg.type === "replying_comment") &&
//             isNullOrUndefined(arg.postId)
//           )
//             return false;
//           return true;
//         },
//         {
//           message:
//             "postId is required for comment and replying_comment notification type",
//           path: ["postId"],
//         }
//       )
//       .refine(
//         (arg) => {
//           if (
//             arg.type === "liking_comment" &&
//             isNullOrUndefined(arg.commentId)
//           )
//             return false;
//           return true;
//         },
//         {
//           message:
//             "commentId is required for liking_comment notification type",
//           path: ["commentId"],
//         }
//       )
//       .refine(
//         (arg) => {
//           if (arg.type === "liking_post" && isNullOrUndefined(arg.postId))
//             return false;
//           return true;
//         },
//         {
//           message: "postId is required for liking_post notification type",
//           path: ["postId"],
//         }
//       )
//   ),
//   tryCatch(createNotification)
// );

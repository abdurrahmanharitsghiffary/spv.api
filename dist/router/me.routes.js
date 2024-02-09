"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const account_controller_1 = require("../controllers/account.controller");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const post_controller_1 = require("../controllers/post.controller");
const follow_controller_1 = require("../controllers/follow.controller");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const chat_controller_1 = require("../controllers/chat.controller");
const notification_controllers_1 = require("../controllers/notification.controllers");
const block_controller_1 = require("../controllers/block.controller");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
const router = express_1.default.Router();
router.use(auth_middlewares_1.verifyToken);
router
    .route("/account")
    .get((0, handler_middlewares_1.tryCatch)(account_controller_1.getMyAccountInfo))
    .patch((0, validator_middlewares_1.validateBody)(zod_1.z.object({
    username: schema_1.zUsername.optional(),
    description: zod_1.z.string().optional(),
    firstName: schema_1.zFirstName.optional(),
    lastName: schema_1.zLastName.optional(),
    gender: schema_1.zGender.optional(),
    birthDate: schema_1.zBirthDate.optional(),
})), (0, handler_middlewares_1.tryCatch)(account_controller_1.updateMyAccount))
    .delete((0, validator_middlewares_1.validateBody)(zod_1.z.object({
    currentPassword: (0, schema_1.zPassword)("currentPassword"),
})), (0, handler_middlewares_1.tryCatch)(account_controller_1.deleteMyAccount));
router.route("/account/changepassword").patch((0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_1.z
        .object({
        currentPassword: (0, schema_1.zPassword)("currentPassword"),
        password: (0, schema_1.zPassword)(),
        confirmPassword: (0, schema_1.zPassword)("confirmPassword"),
    })
        .refine((arg) => {
        if (arg.confirmPassword !== arg.password)
            return false;
        return true;
    }, {
        message: "The password and confirm password do not match.",
        path: ["confirmPassword"],
    }),
})), (0, handler_middlewares_1.tryCatch)(account_controller_1.changeMyAccountPassword));
router
    .route("/account/images")
    .delete((0, validator_middlewares_1.validate)(zod_1.z.object({
    query: zod_1.z.object({
        type: schema_1.zProfileImageType.optional(),
    }),
})), (0, handler_middlewares_1.tryCatch)(account_controller_1.deleteAccountImage))
    .patch(multer_middlewares_1.uploadImageV2.single("image"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validate)(zod_1.z.object({
    query: zod_1.z.object({
        type: schema_1.zProfileImageType.optional(),
    }),
})), (0, handler_middlewares_1.tryCatch)(account_controller_1.updateAccountImage));
router
    .route("/posts/saved")
    .get(validator_middlewares_1.validatePagingOptions, (0, handler_middlewares_1.tryCatch)(post_controller_1.getSavedPosts))
    .post((0, validator_middlewares_1.validateBody)(zod_1.z.object({
    postId: (0, schema_1.zIntId)("postId"),
})), (0, handler_middlewares_1.tryCatch)(post_controller_1.savePost));
router.route("/chats").get((0, validator_middlewares_1.validate)(zod_1.z.object({
    query: zod_1.z.object({
        limit: schema_1.zLimit,
        offset: schema_1.zOffset,
        type: zod_1.z.enum(["group", "all", "personal"]).optional(),
        q: (0, zod_1.string)().optional(),
    }),
})), (0, handler_middlewares_1.tryCatch)(chat_controller_1.getAllChatsByUserId));
router.route("/posts").get(validator_middlewares_1.validatePagingOptions, (0, handler_middlewares_1.tryCatch)(post_controller_1.getAllMyPosts));
router.route("/follow").post((0, validator_middlewares_1.validateBody)(zod_1.z.object({
    userId: (0, schema_1.zIntId)("userId"),
})), (0, handler_middlewares_1.tryCatch)(follow_controller_1.followUser));
router.route("/block").post((0, validator_middlewares_1.validateBody)(zod_1.z.object({
    userId: (0, schema_1.zIntId)("userId"),
})), (0, handler_middlewares_1.tryCatch)(block_controller_1.blockUserById));
router.route("/following").get((0, handler_middlewares_1.tryCatch)(follow_controller_1.getFollowedUser));
router.route("/followers").get((0, handler_middlewares_1.tryCatch)(follow_controller_1.getMyFollowers));
router
    .route("/notifications")
    .get((0, validator_middlewares_1.validate)(zod_1.z.object({
    query: zod_1.z.object({
        limit: schema_1.zLimit,
        offset: schema_1.zOffset,
        order_by: zod_1.z.enum(["latest", "oldest"]).optional(),
    }),
})), (0, handler_middlewares_1.tryCatch)(notification_controllers_1.getAllUserNotifications))
    .delete((0, validator_middlewares_1.validate)(zod_1.z.object({
    query: zod_1.z.object({
        before_timestamp: zod_1.z
            .any()
            .refine((arg) => {
            if (!Number.isNaN(Number(arg)))
                return true;
            if (["y", "d", "h"].some((t) => arg.endsWith(t)))
                return true;
            return false;
        }, {
            message: "Invalid before_timestamp query options, query options must be a number of ms or a number value followed by: h (hours), d (day), y (year). example value: 1h, 2d, 1y, 60000.",
        })
            .optional(),
    }),
})), (0, handler_middlewares_1.tryCatch)(notification_controllers_1.clearNotifications));
router.route("/notifications/read").post((0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.any().refine((arg) => {
            if (arg === "all")
                return true;
            if (arg instanceof Array &&
                arg.every((a) => typeof a === "number" && !isNaN(a)))
                return true;
        }, {
            message: "Invalid ids value, ids must be string 'all' or array containing the notification ids",
        }),
    }),
})), (0, handler_middlewares_1.tryCatch)(notification_controllers_1.readNotifications));
router
    .route("/posts/saved/:postId")
    .delete((0, validator_middlewares_1.validateParamsV2)("postId"), (0, handler_middlewares_1.tryCatch)(post_controller_1.deleteSavedPost));
router
    .route("/posts/saved/:postId/bookmarked")
    .get((0, validator_middlewares_1.validateParamsV2)("postId"), (0, handler_middlewares_1.tryCatch)(post_controller_1.getPostIsSaved));
router
    .route("/block/:userId")
    .delete((0, validator_middlewares_1.validateParamsV2)("userId"), (0, handler_middlewares_1.tryCatch)(block_controller_1.unblockUser));
router
    .route("/follow/:followId")
    .delete((0, validator_middlewares_1.validateParamsV2)("followId"), (0, handler_middlewares_1.tryCatch)(follow_controller_1.unfollowUser));
exports.default = router;
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

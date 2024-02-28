import express from "express";
import { verifyToken } from "../middlewares/auth.middlewares";
import { uploadImageV2 } from "../middlewares/multer.middlewares";
import { uploadFilesToCloudinary } from "../middlewares/cloudinary.middleware";
import {
  validate,
  validateBody,
  validatePagingOptions,
  validateParamsV2,
} from "../middlewares/validator.middlewares";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { zParticipants, zfdParticipants } from "../schema/chat.schema";
import {
  addGroupParticipants,
  approveGroupChatApplicationRequest,
  createGroupChat,
  deleteGroupChat,
  deleteGroupParticipants,
  getGroupChatApplicationRequest,
  joinGroupChat,
  leaveGroupChat,
  rejectGroupChatApplicationRequest,
  requestGroupChatApplication,
  updateGroupChat,
  updateGroupChatParticipants,
} from "../controllers/groupChat.controllers";
import { tryCatch } from "../middlewares/handler.middlewares";
import { zIntOrStringId, zUniqueInts, zfdText } from "../schema";
import { protectChatRoom } from "../middlewares/chatRoom.middlewares";
import { checkIsParticipatedInChatRoom } from "../middlewares";

const router = express.Router();
const validateIds = validateBody(z.object({ ids: zUniqueInts("ids") }));

router.use(verifyToken);

router.route("/").post(
  uploadImageV2.single("image"),
  uploadFilesToCloudinary,
  validateBody(
    zfd.formData(
      z.object({
        participants: zfdParticipants("participants", 2),
        title: zfd.text(z.string().optional()),
        description: zfd.text(z.string().optional()),
        applyType: zfd.text(z.enum(["public", "private"])).optional(),
        groupVisibility: zfd.text(z.enum(["public", "private"])).optional(),
      })
    )
  ),
  tryCatch(createGroupChat)
);

router
  .route("/:groupId")
  .patch(
    uploadImageV2.single("image"),
    uploadFilesToCloudinary,
    validate(
      z.object({
        body: zfd.formData(
          z.object({
            description: zfdText.optional(),
            title: zfd.text(z.string().max(125).optional()),
            applyType: zfd.text(z.enum(["public", "private"])).optional(),
            groupVisibility: zfd.text(z.enum(["public", "private"])).optional(),
          })
        ),
        params: z.object({
          groupId: zIntOrStringId,
        }),
      })
    ),
    protectChatRoom("groupId", true),
    tryCatch(updateGroupChat)
  )
  .delete(
    validateParamsV2("groupId"),
    protectChatRoom("groupId", true, true),
    tryCatch(deleteGroupChat)
  );

router
  .route("/:groupId/participants")
  .post(
    validateParamsV2("groupId"),
    validateIds,
    protectChatRoom("groupId", true),
    tryCatch(addGroupParticipants)
  )
  .patch(
    validate(
      z.object({
        body: z.object({
          participants: zParticipants("participants", 1),
        }),
        params: z.object({
          groupId: zIntOrStringId,
        }),
      })
    ),
    protectChatRoom("groupId", true),
    tryCatch(updateGroupChatParticipants)
  )
  .delete(
    validate(
      z.object({
        body: z.object({
          ids: zUniqueInts("ids"),
        }),
        params: z.object({
          groupId: zIntOrStringId,
        }),
      })
    ),
    protectChatRoom("groupId", true),
    tryCatch(deleteGroupParticipants)
  );

router
  .route("/:groupId/join")
  .post(validateParamsV2("groupId"), tryCatch(joinGroupChat));

router
  .route("/:groupId/membership-requests")
  .post(
    validateParamsV2("groupId"),
    validateBody(z.object({ comment: z.string().optional() })),
    tryCatch(requestGroupChatApplication)
  )
  .get(
    validateParamsV2("groupId"),
    validatePagingOptions,
    validate(
      z.object({
        query: z.object({
          type: z.enum(["pending", "approved", "rejected", "all"]).optional(),
        }),
      })
    ),
    checkIsParticipatedInChatRoom({
      params: "groupId",
      shouldAlsoBlockUserRole: true,
    }),
    tryCatch(getGroupChatApplicationRequest)
  );

router
  .route("/:groupId/leave")
  .delete(validateParamsV2("groupId"), tryCatch(leaveGroupChat));

router
  .route("/:groupId/membership-requests/:requestId/approve")
  .post(
    validateParamsV2("groupId"),
    validateParamsV2("requestId"),
    protectChatRoom("groupId", true),
    tryCatch(approveGroupChatApplicationRequest)
  );
router
  .route("/:groupId/membership-requests/:requestId/reject")
  .delete(
    validateParamsV2("groupId"),
    validateParamsV2("requestId"),
    protectChatRoom("groupId", true),
    tryCatch(rejectGroupChatApplicationRequest)
  );

export default router;

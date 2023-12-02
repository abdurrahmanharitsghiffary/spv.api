import express from "express";
import { verifyToken } from "../middlewares/auth.middlewares";
import { tryCatch } from "../middlewares/handler.middlewares";

import {
  validate,
  validateBody,
  validateParamsV2,
} from "../middlewares/validator.middlewares";

import { z } from "zod";

import { zIntId, zIntOrStringId, zLimit, zOffset, zfdText } from "../schema";
import {
  createChatRoom,
  getChatRoomById,
  getChatRoomMessagesByRoomId,
  getChatRoomParticipantsByRoomId,
} from "../controllers/chatRoom.controller";
import { protectChatRoom } from "../middlewares/chatRoom.middlewares";
import {
  createGroupChat,
  deleteGroupChat,
  joinGroupChat,
  leaveGroupChat,
  updateGroupChat,
} from "../controllers/groupChat.controllers";
import { uploadImage } from "../middlewares/multer.middlewares";
import { zfd } from "zod-form-data";

const router = express.Router();

router.use(verifyToken);

const validatePagingOptionsExt = validate(
  z.object({
    params: z.object({ roomId: zIntOrStringId }),
    query: z.object({ limit: zLimit, offset: zOffset }),
  })
);

router
  .route("/")
  .post(
    validateBody(z.object({ participantId: zIntId("participantId") })),
    tryCatch(createChatRoom)
  );

router.route("/:roomId").get(tryCatch(getChatRoomById));

router
  .route("/:roomId/messages")
  .get(validatePagingOptionsExt, tryCatch(getChatRoomMessagesByRoomId));

router
  .route("/:roomId/participants")
  .get(validatePagingOptionsExt, tryCatch(getChatRoomParticipantsByRoomId));

router.route("/group").post(
  uploadImage.single("image"),
  validateBody(
    zfd.formData(
      z.object({
        participants: zfd.repeatable(
          zfd.numeric(zIntId("participants")).array().min(2)
        ),
        title: zfd.text(z.string().optional()),
        description: zfd.text(z.string().optional()),
      })
    )
  ),
  createGroupChat
);

router
  .route("/group/:groupId")
  .patch(
    uploadImage.single("image"),
    validate(
      z.object({
        body: zfd.formData(
          z.object({
            participants: zfd.repeatable(
              zfd.numeric(zIntId("participants")).array().optional()
            ),
            admin: zfd.repeatable(
              zfd.numeric(zIntId("admins")).array().optional()
            ),
            description: zfdText.optional(),
            title: zfd.text(z.string().max(125).optional()),
          })
        ),
        params: z.object({
          groupId: zIntOrStringId,
        }),
      })
    ),
    protectChatRoom,
    tryCatch(updateGroupChat)
  )
  .delete(
    validateParamsV2("groupId"),
    protectChatRoom,
    tryCatch(deleteGroupChat)
  );

router
  .route("/group/:groupId/join")
  .post(validateParamsV2("groupId"), joinGroupChat);
router
  .route("/group/:groupId/leave")
  .delete(validateParamsV2("groupId"), leaveGroupChat);

export default router;

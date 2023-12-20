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
  getParticipant,
} from "../controllers/chatRoom.controller";
import { protectChatRoom } from "../middlewares/chatRoom.middlewares";
import {
  createGroupChat,
  deleteGroupChat,
  deleteGroupParticipants,
  joinGroupChat,
  leaveGroupChat,
  updateGroupChat,
  updateGroupChatParticipants,
} from "../controllers/groupChat.controllers";
import { uploadImage } from "../middlewares/multer.middlewares";
import { zfd } from "zod-form-data";
import { zParticipants, zfdParticipants } from "../schema/chat.schema";
import { checkIsParticipatedInChatRoom } from "../middlewares";

const router = express.Router();

router.use(verifyToken);

const checkIsParticipated = checkIsParticipatedInChatRoom({ params: "roomId" });

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

router
  .route("/:roomId")
  .get(
    validateParamsV2("roomId"),
    checkIsParticipated,
    tryCatch(getChatRoomById)
  );

router
  .route("/:roomId/messages")
  .get(
    validatePagingOptionsExt,
    checkIsParticipated,
    tryCatch(getChatRoomMessagesByRoomId)
  );

router
  .route("/:roomId/participants")
  .get(
    validatePagingOptionsExt,
    checkIsParticipated,
    tryCatch(getChatRoomParticipantsByRoomId)
  )
  .patch(
    validate(
      z.object({
        body: z.object({
          participants: zParticipants("participants", 1),
        }),
        params: z.object({
          roomId: zIntOrStringId,
        }),
      })
    ),
    protectChatRoom("roomId", true),
    tryCatch(updateGroupChatParticipants)
  )
  .delete(
    validate(
      z.object({
        body: z.object({
          ids: z.array(z.number()),
        }),
        params: z.object({
          roomId: zIntOrStringId,
        }),
      })
    ),
    protectChatRoom("roomId", true),
    tryCatch(deleteGroupParticipants)
  );

router.route("/:roomId/participants/:participantId").get(
  validate(
    z.object({
      params: z.object({
        roomId: zIntOrStringId,
        participantId: zIntOrStringId,
      }),
    })
  ),
  tryCatch(getParticipant)
);

router.route("/group").post(
  uploadImage.single("image"),
  validateBody(
    zfd.formData(
      z.object({
        participants: zfdParticipants("participants", 2),
        title: zfd.text(z.string().optional()),
        description: zfd.text(z.string().optional()),
      })
    )
  ),
  tryCatch(createGroupChat)
);

router
  .route("/group/:groupId")
  .patch(
    uploadImage.single("image"),
    validate(
      z.object({
        body: zfd.formData(
          z.object({
            participants: zfdParticipants("participants").optional(),
            description: zfdText.optional(),
            title: zfd.text(z.string().max(125).optional()),
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
  .route("/group/:groupId/join")
  .post(validateParamsV2("groupId"), tryCatch(joinGroupChat));
router
  .route("/group/:groupId/leave")
  .delete(validateParamsV2("groupId"), tryCatch(leaveGroupChat));

export default router;

import express from "express";
import { verifyToken } from "../middlewares/auth.middlewares";
import { tryCatch } from "../middlewares/handler.middlewares";

import {
  validate,
  validateBody,
  validateParamsV2,
} from "../middlewares/validator.middlewares";

import { z } from "zod";

import { zIntId, zIntOrStringId, zText } from "../schema";
import {
  createChatRoom,
  deleteChatRoom,
  getChatRoomById,
  getChatRoomMessagesByRoomId,
  getChatRoomParticipantsByRoomId,
  updateChatRoom,
} from "../controllers/chatRoom.controller";
import { protectChatRoom } from "../middlewares/chatRoom.middlewares";
import {
  createGroupChat,
  joinGroupChat,
  leaveGroupChat,
} from "../controllers/groupChat.controllers";

const router = express.Router();

router.use(verifyToken);

router
  .route("/")
  .post(
    validateBody(z.object({ participantId: zIntId("participantId") })),
    tryCatch(createChatRoom)
  );

router
  .route("/:roomId")
  .get(tryCatch(getChatRoomById))
  .patch(
    validate(
      z.object({
        body: z.object({
          participants: zIntId("participants").array().optional(),
          description: zText.optional(),
          title: z.string().max(125).optional(),
        }),
        params: z.object({
          roomId: zIntOrStringId,
        }),
      })
    ),
    protectChatRoom,
    tryCatch(updateChatRoom)
  )
  .delete(
    validateParamsV2("roomId"),
    protectChatRoom,
    tryCatch(deleteChatRoom)
  );

router
  .route("/:roomId/messages")
  .get(validateParamsV2("roomId"), tryCatch(getChatRoomMessagesByRoomId));

router
  .route("/:roomId/participants")
  .get(validateParamsV2("roomId"), tryCatch(getChatRoomParticipantsByRoomId));

router.route("/group").post(
  validateBody(
    z.object({
      participants: zIntId("participants").array().min(2),
    })
  ),
  createGroupChat
);

router
  .route("/group/:groupId/join")
  .patch(validateParamsV2("groupId"), joinGroupChat);
router
  .route("/group/:groupId/leave")
  .delete(validateParamsV2("groupId"), leaveGroupChat);

export default router;

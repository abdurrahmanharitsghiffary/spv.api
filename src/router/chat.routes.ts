import express from "express";
import { verifyToken } from "../middlewares/auth.middlewares";
import { tryCatch } from "../middlewares/handler.middlewares";

import {
  validate,
  validateBody,
  validatePagingOptions,
  validateParamsV2,
} from "../middlewares/validator.middlewares";

import { z } from "zod";

import {
  zIntId,
  zIntOrStringId,
  zLimit,
  zOffset,
  zUniqueInts,
  zfdText,
} from "../schema";
import {
  createChatRoom,
  getChatRoomById,
  getChatRoomMessagesByRoomId,
  getChatRoomParticipantsByRoomId,
  getParticipant,
} from "../controllers/chatRoom.controller";
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
  checkIsParticipated,
  tryCatch(getParticipant)
);

export default router;

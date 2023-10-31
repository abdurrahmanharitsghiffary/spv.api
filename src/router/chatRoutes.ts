import express from "express";
import { verifyToken } from "../middlewares/auth";
import { uploadImage } from "../utils/uploadImage";
import {
  createChat,
  deleteChatById,
  getChatsByRecipientId,
  updateChatById,
} from "../controllers/chatController";
import { tryCatch, tryCatchMiddleware } from "../middlewares/tryCatch";
import { protectChat } from "../middlewares/protectChat";
import {
  isUserBlockOrBlocked_Body,
  isUserBlockOrBlocked_Params,
} from "../middlewares/userBlock";
import {
  validate,
  validateBody,
  validateParamsV2,
} from "../middlewares/validate";
import { z } from "zod";
import { zChatMessage, zRecipientId } from "../schema/chat";
import { zIntOrStringId } from "../schema";

const router = express.Router();
const chatBlockCustomMessage = {
  blockedMessage:
    "You cannot send message to this user, because you have been blocked by this user.",
  blockingMessage:
    "You cannot send message to this user, because you have blocked this user.",
};
router.use(verifyToken);

router.route("/").post(
  uploadImage.single("image"),
  validateBody(
    z.object({
      message: zChatMessage,
      recipientId: zRecipientId,
    })
  ),
  isUserBlockOrBlocked_Body("recipientId", chatBlockCustomMessage),
  tryCatch(createChat)
);

router
  .route("/:chatId")
  .delete(
    validateParamsV2("chatId"),
    tryCatchMiddleware(protectChat),
    tryCatch(deleteChatById)
  )
  .patch(
    validate(
      z.object({
        body: z.object({
          message: zChatMessage,
        }),
        params: z.object({
          chatId: zIntOrStringId,
        }),
      })
    ),
    tryCatchMiddleware(protectChat),
    tryCatch(updateChatById)
  );

router
  .route("/users/:recipientId")
  .get(
    isUserBlockOrBlocked_Params("recipientId"),
    tryCatch(getChatsByRecipientId)
  );

export default router;

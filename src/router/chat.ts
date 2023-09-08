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
  sanitizeChat,
  sanitizeMessage,
} from "../middlewares/validation/sanitizeChat";

const router = express.Router();

router.use(verifyToken);

router
  .route("/")
  .post(uploadImage.single("image"), sanitizeChat, tryCatch(createChat));
router.route("/rooms/:recipientId").get(tryCatch(getChatsByRecipientId));
router
  .route("/:chatId")
  .delete(tryCatchMiddleware(protectChat), tryCatch(deleteChatById))
  .patch(
    tryCatchMiddleware(protectChat),
    sanitizeMessage,
    tryCatch(updateChatById)
  );

export default router;

import express from "express";
import { verifyToken } from "../middlewares/auth.middlewares";
import { uploadImage } from "../middlewares/multer.middlewares";
import {
  createChat,
  deleteChatById,
  updateChatById,
} from "../controllers/chat.controller";
import {
  tryCatch,
  tryCatchMiddleware,
} from "../middlewares/handler.middlewares";
import { protectChat } from "../middlewares/chat.middlewares";
import {
  validate,
  validateBody,
  validateParamsV2,
} from "../middlewares/validator.middlewares";
import { zfd } from "zod-form-data";
import { z } from "zod";
import { zChatMessage, zfdChatMessage } from "../schema/chat.schema";
import { zIntOrStringId, zfdInt } from "../schema";

const router = express.Router();

router.use(verifyToken);

router.route("/").post(
  uploadImage.array("images"),
  validateBody(
    zfd.formData(
      z.object({
        message: zfdChatMessage,
        chatRoomId: zfdInt("chatRoomId"),
      })
    )
  ),
  tryCatch(createChat)
);

router
  .route("/:messageId")
  .delete(
    validateParamsV2("messageId"),
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
          messageId: zIntOrStringId,
        }),
      })
    ),
    tryCatchMiddleware(protectChat),
    tryCatch(updateChatById)
  );

export default router;

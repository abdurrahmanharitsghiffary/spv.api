import express from "express";
import {
  createComment,
  deleteComment,
  getComment,
  updateComment,
  createReplyComment,
} from "../controllers/commentController";
import { verifyToken } from "../middlewares/auth";
import { tryCatch, tryCatchMiddleware } from "../middlewares/tryCatch";
import { protectComment } from "../middlewares/protectComment";
import { uploadImage } from "../utils/uploadImage";
import { sanitizeComment } from "../middlewares/validation/sanitizeComment";

const router = express.Router();

router
  .route("/")
  .post(
    verifyToken,
    uploadImage.single("image"),
    sanitizeComment,
    tryCatch(createComment)
  );
router
  .route("/:commentId")
  .post(
    verifyToken,
    uploadImage.single("image"),
    sanitizeComment,
    tryCatch(createReplyComment)
  )
  .get(tryCatch(getComment))
  .patch(
    verifyToken,
    tryCatchMiddleware(protectComment),
    sanitizeComment,
    tryCatch(updateComment)
  )
  .delete(
    verifyToken,
    tryCatchMiddleware(protectComment),
    tryCatch(deleteComment)
  );

export default router;

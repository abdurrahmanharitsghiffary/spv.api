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
import {
  createLike,
  deleteLike,
  getCommentLikesByCommentId,
  getCommentIsLiked,
} from "../controllers/commentLikeController";
import {
  validate,
  validateBody,
  validateParamsV2,
} from "../middlewares/validate";
import { z } from "zod";
import { zIntId, zIntOrStringId, zText } from "../schema";

const router = express.Router();

router.use(verifyToken);

router.route("/").post(
  uploadImage.single("image"),
  validateBody(
    z.object({
      comment: zText,
      postId: zIntId("postId"),
      parentId: zIntId("parentId").optional(),
      imageSrc: z.string().optional(),
    })
  ),
  tryCatch(createComment)
);

router
  .route("/:commentId")
  .get(validateParamsV2("commentId"), tryCatch(getComment))
  .post(
    uploadImage.single("image"),
    validate(
      z.object({
        body: z.object({
          comment: zText,
          imageSrc: z.string().optional(),
        }),
        params: z.object({
          commentId: zIntOrStringId,
        }),
      })
    ),
    tryCatch(createReplyComment)
  )
  .patch(
    validate(
      z.object({
        body: z.object({
          comment: zText,
        }),
        params: z.object({
          commentId: zIntOrStringId,
        }),
      })
    ),
    tryCatchMiddleware(protectComment),
    tryCatch(updateComment)
  )
  .delete(
    validateParamsV2("commentId"),
    tryCatchMiddleware(protectComment),
    tryCatch(deleteComment)
  );

router
  .route("/:commentId/likes")
  .get(validateParamsV2("commentId"), tryCatch(getCommentLikesByCommentId))
  .post(validateParamsV2("commentId"), tryCatch(createLike))
  .delete(validateParamsV2("commentId"), tryCatch(deleteLike));

router
  .route("/:commentId/liked")
  .get(validateParamsV2("commentId"), tryCatch(getCommentIsLiked));

export default router;

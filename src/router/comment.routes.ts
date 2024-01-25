import express from "express";
import {
  createComment,
  deleteComment,
  getComment,
  updateComment,
  createReplyComment,
} from "../controllers/comment.controller";
import { verifyToken } from "../middlewares/auth.middlewares";
import {
  tryCatch,
  tryCatchMiddleware,
} from "../middlewares/handler.middlewares";
import { protectComment } from "../middlewares/comment.middlewares";
import { uploadImageV2 } from "../middlewares/multer.middlewares";
import {
  createLike,
  deleteLike,
  getCommentLikesByCommentId,
  getCommentIsLiked,
} from "../controllers/commentLike.controller";
import {
  validate,
  validateBody,
  validateParamsV2,
} from "../middlewares/validator.middlewares";
import { z } from "zod";
import { zIntOrStringId, zLimit, zOffset, zText, zfdInt } from "../schema";
import { zfd } from "zod-form-data";
import { uploadFilesToCloudinary } from "../middlewares/cloudinary.middleware";

const router = express.Router();

router.use(verifyToken);

router.route("/").post(
  uploadImageV2.single("image"),
  uploadFilesToCloudinary,
  validateBody(
    zfd.formData(
      z.object({
        comment: zfd.text(z.string().optional()).optional(),
        postId: zfdInt("postId"),
        parentId: zfdInt("parentId").optional(),
        imageSrc: zfd.text(z.string().optional()).optional(),
      })
    )
  ),
  tryCatch(createComment)
);

router
  .route("/:commentId")
  .get(validateParamsV2("commentId"), tryCatch(getComment))
  .post(
    uploadImageV2.single("image"),
    uploadFilesToCloudinary,
    validate(
      z.object({
        body: zfd.formData(
          z.object({
            comment: zfd.text(z.string().optional()).optional(),
            imageSrc: zfd.text(z.string().optional()).optional(),
          })
        ),
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
  .get(
    validate(
      z.object({
        params: z.object({
          commentId: zIntOrStringId,
        }),
        query: z.object({
          offset: zOffset,
          limit: zLimit,
        }),
      })
    ),
    tryCatch(getCommentLikesByCommentId)
  )
  .post(validateParamsV2("commentId"), tryCatch(createLike))
  .delete(validateParamsV2("commentId"), tryCatch(deleteLike));

router
  .route("/:commentId/liked")
  .get(validateParamsV2("commentId"), tryCatch(getCommentIsLiked));

export default router;

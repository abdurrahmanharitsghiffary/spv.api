import express from "express";
import {
  tryCatch,
  tryCatchMiddleware,
} from "../middlewares/handler.middlewares";
import {
  createPost,
  deletePost,
  deletePostImageById,
  deletePostImagesByPostId,
  getAllPosts,
  getFollowedUserPost,
  getPost,
  getPostCommentsById,
  updatePost,
} from "../controllers/post.controller";
import { isAdmin, verifyToken } from "../middlewares/auth.middlewares";
import { protectPost } from "../middlewares/post.middlewares";
import { uploadImage } from "../middlewares/multer.middlewares";
import {
  createLike,
  deleteLike,
  getPostIsLiked,
  getPostLikesByPostId,
} from "../controllers/postLike.controller";
import {
  validate,
  validateBody,
  validatePagingOptions,
  validateParamsV2,
} from "../middlewares/validator.middlewares";
import { z } from "zod";
import { zIntOrStringId, zfdText, zfdTitle } from "../schema";
import { postCommentValidationQuery } from "../schema/comment.schema";
import { zfd } from "zod-form-data";

const router = express.Router();

router.use(verifyToken);

router
  .route("/")
  .post(
    uploadImage.array("images"),
    validateBody(
      zfd.formData(
        z.object({
          title: zfdTitle,
          content: zfdText,
        })
      )
    ),
    tryCatch(createPost)
  )
  .get(validatePagingOptions, isAdmin, tryCatch(getAllPosts));

router
  .route("/following")
  .get(validatePagingOptions, tryCatch(getFollowedUserPost));

router
  .route("/:postId")
  .get(validateParamsV2("postId"), tryCatch(getPost))
  .patch(
    uploadImage.array("images"),
    validate(
      z.object({
        body: zfd.formData(
          z.object({
            title: zfdTitle,
            content: zfdText,
          })
        ),
        params: z.object({
          postId: zIntOrStringId,
        }),
      })
    ),
    tryCatchMiddleware(protectPost),
    tryCatch(updatePost)
  )
  .delete(
    validateParamsV2("postId"),
    tryCatchMiddleware(protectPost),
    tryCatch(deletePost)
  );

router.route("/:postId/comments").get(
  validate(
    z.object({
      query: postCommentValidationQuery,
      params: z.object({
        postId: zIntOrStringId,
      }),
    })
  ),
  tryCatch(getPostCommentsById)
);

router
  .route("/:postId/liked")
  .get(validateParamsV2("postId"), tryCatch(getPostIsLiked));

router
  .route("/:postId/likes")
  .get(validateParamsV2("postId"), tryCatch(getPostLikesByPostId))
  .post(validateParamsV2("postId"), tryCatch(createLike))
  .delete(validateParamsV2("postId"), tryCatch(deleteLike));

router
  .route("/:postId/images")
  .delete(
    validateParamsV2("postId"),
    tryCatchMiddleware(protectPost),
    tryCatch(deletePostImagesByPostId)
  );

router.route("/:postId/images/:imageId").delete(
  validate(
    z.object({
      params: z.object({
        postId: zIntOrStringId,
        imageId: zIntOrStringId,
      }),
    })
  ),
  tryCatchMiddleware(protectPost),
  tryCatch(deletePostImageById)
);

export default router;

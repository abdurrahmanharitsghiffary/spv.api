import express from "express";
import { tryCatch, tryCatchMiddleware } from "../middlewares/tryCatch";
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
} from "../controllers/postController";
import { isAdmin, verifyToken } from "../middlewares/auth";
import { protectPost } from "../middlewares/protectPost";
import { uploadImage } from "../utils/uploadImage";
import {
  createLike,
  deleteLike,
  getPostIsLiked,
  getPostLikesByPostId,
} from "../controllers/postLikeController";
import { protectLike } from "../middlewares/protectLike";
import { validateBody, validateParamsV2 } from "../middlewares/validate";
import { z } from "zod";
import { zText, zTitle } from "../schema";

const router = express.Router();

router.use(verifyToken);

router
  .route("/")
  .post(
    uploadImage.array("images"),
    validateBody(
      z.object({
        title: zTitle,
        content: zText,
      })
    ),
    tryCatch(createPost)
  )
  .get(isAdmin, tryCatch(getAllPosts));

router.route("/following").get(tryCatch(getFollowedUserPost));

router
  .route("/:postId")
  .get(tryCatch(getPost))
  .patch(
    tryCatchMiddleware(protectPost),
    uploadImage.array("images"),
    validateBody(
      z.object({
        title: zTitle,
        content: zText,
      })
    ),
    tryCatch(updatePost)
  )
  .delete(
    validateParamsV2("postId"),
    tryCatchMiddleware(protectPost),
    tryCatch(deletePost)
  );

router.route("/:postId/comments").get(tryCatch(getPostCommentsById));

router.route("/:postId/isliked").get(tryCatch(getPostIsLiked));

router
  .route("/:postId/likes")
  .get(tryCatch(getPostLikesByPostId))
  .post(validateParamsV2("postId"), tryCatch(createLike))
  .delete(tryCatchMiddleware(protectLike), tryCatch(deleteLike));

router
  .route("/:postId/images")
  .delete(
    validateParamsV2("postId"),
    tryCatchMiddleware(protectPost),
    tryCatch(deletePostImagesByPostId)
  );

router
  .route("/:postId/images/:imageId")
  .delete(
    validateParamsV2("postId"),
    tryCatchMiddleware(protectPost),
    tryCatch(deletePostImageById)
  );

export default router;

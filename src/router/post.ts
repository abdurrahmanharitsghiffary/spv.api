import express from "express";
import { tryCatch, tryCatchMiddleware } from "../middlewares/tryCatch";
import {
  createPost,
  deletePost,
  getAllMyPosts,
  getAllPosts,
  getPost,
  updatePost,
} from "../controllers/postController";
import { isAdmin, verifyToken } from "../middlewares/auth";
import { checkPostBelong } from "../middlewares/checkPostBelong";

const router = express.Router();

router.route("/me").get(verifyToken, tryCatch(getAllMyPosts));
router
  .route("/:postId")
  .get(tryCatch(getPost))
  .patch(verifyToken, tryCatchMiddleware(checkPostBelong), tryCatch(updatePost))
  .delete(
    verifyToken,
    tryCatchMiddleware(checkPostBelong),
    tryCatch(deletePost)
  );
router
  .route("/")
  .post(verifyToken, tryCatch(createPost))
  .get(verifyToken, isAdmin, tryCatch(getAllPosts));

export default router;

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
import { checkCommentBelong } from "../middlewares/checkCommentBelong";

const router = express.Router();

router
  .route("/:commentId")
  .post(verifyToken, tryCatch(createReplyComment))
  .get(tryCatch(getComment))
  .patch(
    verifyToken,
    tryCatchMiddleware(checkCommentBelong),
    tryCatch(updateComment)
  )
  .delete(
    verifyToken,
    tryCatchMiddleware(checkCommentBelong),
    tryCatch(deleteComment)
  );
router.route("/").post(verifyToken, tryCatch(createComment));

export default router;

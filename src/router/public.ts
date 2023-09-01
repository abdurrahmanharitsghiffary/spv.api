import express from "express";

const router = express.Router();

router.route("/posts/:postId");
router.route("/posts/:postId/comments");
router.route("/posts/:postId/likes");
router.route("/users/:userId");
router.route("/comments/:commentId");

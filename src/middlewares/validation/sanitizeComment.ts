import { body } from "express-validator";

// comment, postId, parentId
export const sanitizeComment = [
  body("comment").escape(),
  body("postId").escape(),
  body("parentId").escape(),
];

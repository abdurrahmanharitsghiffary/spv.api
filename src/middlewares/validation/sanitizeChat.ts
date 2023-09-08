import { body } from "express-validator";
export const sanitizeChat = [
  body("recipientId").escape(),
  body("message").escape(),
];

export const sanitizeMessage = [body("message").escape()];

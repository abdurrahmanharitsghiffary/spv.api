import { body } from "express-validator";
export const sanitizeUpdateAccount = [
  body("username").escape(),
  body("description").escape(),
];

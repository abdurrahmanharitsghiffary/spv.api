import { body } from "express-validator";

export const sanitizeLogin = [
  body("email").escape(),
  body("password").escape(),
];

export const sanitizeSignUp = [
  body("email").escape(),
  body("username").escape(),
  body("password").escape(),
];

import { z } from "zod";
import {
  zBirthDate,
  zEmail,
  zFirstName,
  zGender,
  zLastName,
  zPassword,
  zText,
  zUsername,
} from ".";
import { errorsMessage } from "../lib/consts";
import { zfd } from "zod-form-data";

export const validateConfirmPassword = {
  cb: (arg: { password: string; confirmPassword: string }) => {
    if (arg.confirmPassword !== arg.password) {
      return false;
    }
    return true;
  },
  message: {
    message: errorsMessage.FAILED_CONFIRMATION_MESSAGE,
    path: ["confirmPassword"],
  },
};

export const userValidationSignUpSchema = z.object({
  body: z.object({
    username: zUsername,
    lastName: zLastName,
    firstName: zFirstName,
    password: zPassword(),
    email: zEmail,
    gender: zGender.optional(),
    birthDate: zBirthDate.optional(),
  }),
});

export const userValidationSignInSchema = z.object({
  body: z
    .object({
      email: zEmail,
      password: zPassword(),
      confirmPassword: zPassword("confirmPassword"),
    })
    .refine(validateConfirmPassword.cb, validateConfirmPassword.message),
});

export const createUserSchema = z
  .object({
    role: zfd.text(z.enum(["user", "admin"])).optional(),
    username: zfd.text(zUsername),
    lastName: zfd.text(zLastName),
    firstName: zfd.text(zFirstName),
    password: zfd.text(zPassword()),
    confirmPassword: zfd.text(zPassword("confirmPassword")),
    email: zfd.text(zEmail),
    gender: zfd.text(zGender).optional(),
    birthDate: zBirthDate.optional(),
  })
  .refine(validateConfirmPassword.cb, validateConfirmPassword.message);

export const updateUserSchema = z.object({
  role: zfd.text(z.enum(["user", "admin"])).optional(),
  username: zfd.text(zUsername).optional(),
  lastName: zfd.text(zLastName).optional(),
  firstName: zfd.text(zFirstName).optional(),
  gender: zfd.text(zGender).optional(),
  birthDate: zBirthDate.optional(),
  description: zfd.text(zText).optional(),
});

export type UserValidationSchema = z.infer<typeof userValidationSignUpSchema>;

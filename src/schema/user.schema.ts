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
    role: z.enum(["user", "admin"]).optional(),
    username: zUsername,
    lastName: zLastName,
    firstName: zFirstName,
    password: zPassword(),
    confirmPassword: zPassword("confirmPassword"),
    email: zEmail,
    gender: zGender.optional(),
    birthDate: zBirthDate.optional(),
  })
  .refine(validateConfirmPassword.cb, validateConfirmPassword.message);

export const updateUserSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  username: zUsername.optional(),
  lastName: zLastName.optional(),
  firstName: zFirstName.optional(),
  gender: zGender.optional(),
  birthDate: zBirthDate.optional(),
  description: zText.optional(),
});

export type UserValidationSchema = z.infer<typeof userValidationSignUpSchema>;

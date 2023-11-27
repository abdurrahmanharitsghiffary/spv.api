import { z } from "zod";
import {
  zBirthDate,
  zEmail,
  zFirstName,
  zGender,
  zLastName,
  zPassword,
  zUsername,
} from ".";

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
    .refine(
      (arg) => {
        if (arg.confirmPassword !== arg.password) {
          return false;
        }
        return true;
      },
      {
        message: "The password and confirm password do not match.",
        path: ["confirmPassword"],
      }
    ),
});

export type UserValidationSchema = z.infer<typeof userValidationSignUpSchema>;

import { z } from "zod";

export const userValidationSignUpSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .min(4, {
        message: "Username is must at 4 character",
      })
      .max(50, {
        message: "Username is must at least below 50 characters",
      }),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, {
        message: "Password is must at least 8 characters",
      })
      .max(22, { message: "Password is must not be higher than 22 chars" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email format" }),
  }),
});

export const userValidationSignInSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email format" }),
  }),
});

export type UserValidationSchema = z.infer<typeof userValidationSignUpSchema>;

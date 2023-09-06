import { z } from "zod";
export const bodyValidationSchema = z.object({});

export const emailValidation = z
  .string({ required_error: "Email is required" })
  .email({ message: "Invalid email format" });

export const passwordValidation = z
  .string({ required_error: "Password is required" })
  .min(8, {
    message: "Password is must at least 8 characters",
  })
  .max(22, { message: "Password is must not be higher than 22 chars" });

export const usernameValidation = z
  .string({ required_error: "Username is required" })
  .min(4, {
    message: "Username is must at 4 character",
  })
  .max(50, {
    message: "Username is must at least below 50 characters",
  });

export const emailRequestValidation = bodyValidationSchema.extend({
  body: z.object({
    email: emailValidation,
  }),
});

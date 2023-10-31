import { z } from "zod";

const MAX_ID_VALUE = 2147483647;

export const zText = z
  .string()
  .min(1, { message: "Must be at least 1 character long." });

export const zUsername = z
  .string({ required_error: "Username must not be empty." })
  .min(4, {
    message: "Username must be at least 4 characters long.",
  })
  .max(100, {
    message: "Username must be 100 characters or fewer.",
  });

export const zProfileImageType = z.enum(["profile", "cover"]);

export const zIntId = (key: string = "id") =>
  z
    .number({ required_error: `${key} must not be empty` })
    .nonnegative()
    .max(2147483647);

export const zIntOrStringId = z
  .string()
  .refine(
    (v) => {
      let n = Number(v);
      return !isNaN(n) && v?.length > 0;
    },
    {
      message: `Invalid params id, expected number or numeric string, received NaN`,
    }
  )
  .refine(
    (v) => {
      const n = Number(v);
      if (n < 0) return false;
      return isNaN(n) || n <= MAX_ID_VALUE;
    },
    {
      message:
        "Params must be signed Int number (less than or equal to 2147483647)",
    }
  );

export const zTitle = z
  .string()
  .max(155, { message: "Title must be 155 characters or fewer." })
  .optional();

export const zFirstName = z
  .string({ required_error: "Firstname must not be empty." })
  .min(2, "Firstname must be at least 2 characters long.")
  .max(125, "Firstname must be 125 characters or fewer.");

export const zLastName = z
  .string({ required_error: "Lastname must not be empty." })
  .min(2, "Lastname must be at least 2 characters long.")
  .max(125, "Lastname must be 125 characters or fewer.");

export const zPassword = (passwordId: string = "Password") =>
  z
    .string({ required_error: `${passwordId} must not be empty.` })
    .min(8, {
      message: `${passwordId} must be at least 8 characters long.`,
    })
    .max(22, { message: `${passwordId} must be 22 characters or fewer.` });

export const zEmail = z
  .string({ required_error: "Email must not be empty." })
  .email({ message: "Invalid email format." });

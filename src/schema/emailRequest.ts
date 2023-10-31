import { z } from "zod";
import { zEmail } from ".";

export const emailRequestValidation = z.object({
  body: z.object({
    email: zEmail,
  }),
});

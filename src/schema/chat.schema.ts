import { z } from "zod";
import { zfd } from "zod-form-data";

export const zChatMessage = z
  .string({ required_error: "Message must not be empty." })
  .min(1, { message: "Message must be at least 1 characters long." });
export const zRecipientId = z
  .number({ required_error: "Recipient id must not be empty" })
  .nonnegative()
  .max(2147483647);
export const zfdChatMessage = zfd.text(zChatMessage);
export const zfdRecipientId = zfd.numeric(zRecipientId);

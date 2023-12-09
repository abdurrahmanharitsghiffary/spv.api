import { z } from "zod";
import { zfd } from "zod-form-data";
import { zIntId } from ".";

export const zChatMessage = z
  .string({ required_error: "Message must not be empty." })
  .min(1, { message: "Message must be at least 1 characters long." });
export const zRecipientId = z
  .number({ required_error: "Recipient id must not be empty" })
  .nonnegative()
  .max(2147483647);
export const zfdChatMessage = zfd.text(zChatMessage);
export const zfdRecipientId = zfd.numeric(zRecipientId);
//

export const zParticipant = (key: string) =>
  z.object({
    id: zIntId(key),
    role: z.enum(["user", "admin"]),
  });

export const zfdParticipant = (key: string) => zfd.json(zParticipant(key));

export const zParticipants = (key: string, min: number = 0) =>
  z
    .array(zParticipant(key))
    .min(min, { message: `${key} must contain at least ${min} id(s).` })
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      {
        message: "Must be an array of unique numbers.",
      }
    );

export const zfdParticipants = (key: string, min: number = 0) =>
  zfd.repeatable(
    z
      .array(zfdParticipant(key))
      .min(min, { message: `${key} must contain at least ${min} id(s).` })
      .refine(
        (items) => new Set(items.map((item) => item.id)).size === items.length,
        {
          message: "Must be an array of unique numbers.",
        }
      )
  );
// export const zfdArrayOfParticipantIds = (key: string, min: number = 0) =>
//   zfd.repeatable(
//     zfd
//       .numeric(zIntId(key))
//       .array()
//       .min(min, { message: `${key} must contain at least ${min} id(s).` })
//       .refine((items) => new Set(items).size === items.length, {
//         message: "Must be an array of unique numbers.",
//       })
//   );

// export const zfdArrayOfParticipantIdsOpt = (key: string) =>
//   zfd.repeatable(
//     zfd
//       .numeric(zIntId(key))
//       .array()
//       .refine((items) => new Set(items).size === items.length, {
//         message: "Must be an array of unique numbers.",
//       })
//       .optional()
//   );

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zfdParticipants = exports.zParticipants = exports.zfdParticipant = exports.zParticipant = exports.zfdRecipientId = exports.zfdChatMessage = exports.zRecipientId = exports.zChatMessage = void 0;
const zod_1 = require("zod");
const zod_form_data_1 = require("zod-form-data");
const _1 = require(".");
exports.zChatMessage = zod_1.z
    .string({ required_error: "Message must not be empty." })
    .min(1, { message: "Message must be at least 1 characters long." });
exports.zRecipientId = zod_1.z
    .number({ required_error: "Recipient id must not be empty" })
    .nonnegative()
    .max(2147483647);
exports.zfdChatMessage = zod_form_data_1.zfd.text(exports.zChatMessage);
exports.zfdRecipientId = zod_form_data_1.zfd.numeric(exports.zRecipientId);
//
const zParticipant = (key) => zod_1.z.object({
    id: (0, _1.zIntId)(key),
    role: zod_1.z.enum(["user", "admin", "co_creator"]),
});
exports.zParticipant = zParticipant;
const zfdParticipant = (key) => zod_form_data_1.zfd.json(zod_1.z.object({
    id: zod_form_data_1.zfd.numeric((0, _1.zIntId)(key)),
    role: zod_form_data_1.zfd.text(zod_1.z.enum(["user", "admin"])),
}));
exports.zfdParticipant = zfdParticipant;
const zParticipants = (key, min = 0) => zod_1.z
    .array((0, exports.zParticipant)(key))
    .min(min, { message: `${key} must contain at least ${min} id(s).` })
    .refine((items) => new Set(items.map((item) => item.id)).size === items.length, {
    message: "Must be an array of unique numbers.",
});
exports.zParticipants = zParticipants;
const zfdParticipants = (key, min = 0) => zod_form_data_1.zfd.repeatable(zod_1.z
    .array((0, exports.zfdParticipant)(key))
    .min(min, { message: `${key} must contain at least ${min} id(s).` })
    .refine((items) => new Set(items.map((item) => item.id)).size === items.length, {
    message: "Must be an array of unique numbers.",
}));
exports.zfdParticipants = zfdParticipants;
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

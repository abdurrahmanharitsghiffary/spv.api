"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailRequestValidation = exports.zBirthDate = exports.zGender = exports.zNotificationType = exports.zEmail = exports.zPassword = exports.zLastName = exports.zFirstName = exports.zfdTitle = exports.zTitle = exports.zfdText = exports.zfdInt = exports.zIntOrStringId = exports.zIntId = exports.zOffset = exports.zLimit = exports.zProfileImageType = exports.zUsername = exports.zText = void 0;
const zod_1 = require("zod");
const zod_form_data_1 = require("zod-form-data");
const MAX_ID_VALUE = 2147483647;
exports.zText = zod_1.z
    .string()
    .min(1, { message: "Must be at least 1 character long." });
exports.zUsername = zod_1.z
    .string({ required_error: "Username must not be empty." })
    .min(4, {
    message: "Username must be at least 4 characters long.",
})
    .max(100, {
    message: "Username must be 100 characters or fewer.",
});
exports.zProfileImageType = zod_1.z.enum(["profile", "cover"]);
exports.zLimit = zod_1.z
    .string()
    .refine((arg) => {
    const n = Number(arg);
    return !isNaN(n) || arg === undefined;
}, {
    message: "Invalid provided limit query, expected number, received NaN value",
})
    .refine((arg) => {
    if (Number(arg) < 0)
        return false;
    return true;
}, {
    message: "Limit must not be negative number",
})
    .refine((arg) => {
    const n = Number(arg);
    if (n > 50)
        return false;
    return true;
}, { message: "Limit must be at least 50 or fewer" })
    .optional();
exports.zOffset = zod_1.z
    .string()
    .refine((arg) => {
    const n = Number(arg);
    return !isNaN(n) || arg === undefined;
}, {
    message: "Invalid provided offset query, expected number, received NaN value",
})
    .refine((arg) => {
    if (Number(arg) < 0)
        return false;
    return arg === undefined || Number(arg) <= MAX_ID_VALUE;
}, {
    message: "Offset must be signed Int number (less than or equal to 2147483647)",
})
    .optional();
const zIntId = (key = "id") => zod_1.z
    .number({ required_error: `${key} must not be empty` })
    .nonnegative()
    .max(2147483647);
exports.zIntId = zIntId;
exports.zIntOrStringId = zod_1.z
    .string()
    .refine((v) => {
    let n = Number(v);
    return !isNaN(n) && (v === null || v === void 0 ? void 0 : v.length) > 0;
}, {
    message: `Invalid params id, expected number or numeric string, received NaN`,
})
    .refine((v) => {
    const n = Number(v);
    if (n < 0)
        return false;
    return isNaN(n) || n <= MAX_ID_VALUE;
}, {
    message: "Params must be signed Int number (less than or equal to 2147483647)",
});
const zfdInt = (key = "id") => zod_form_data_1.zfd.numeric((0, exports.zIntId)(key));
exports.zfdInt = zfdInt;
exports.zfdText = zod_form_data_1.zfd.text(exports.zText);
exports.zTitle = zod_1.z
    .string()
    .max(155, { message: "Title must be 155 characters or fewer." })
    .optional();
exports.zfdTitle = zod_form_data_1.zfd.text(exports.zTitle);
exports.zFirstName = zod_1.z
    .string({ required_error: "Firstname must not be empty." })
    .min(2, "Firstname must be at least 2 characters long.")
    .max(125, "Firstname must be 125 characters or fewer.");
exports.zLastName = zod_1.z
    .string({ required_error: "Lastname must not be empty." })
    .min(2, "Lastname must be at least 2 characters long.")
    .max(125, "Lastname must be 125 characters or fewer.");
const zPassword = (passwordId = "Password") => zod_1.z
    .string({ required_error: `${passwordId} must not be empty.` })
    .min(8, {
    message: `${passwordId} must be at least 8 characters long.`,
})
    .max(22, { message: `${passwordId} must be 22 characters or fewer.` });
exports.zPassword = zPassword;
exports.zEmail = zod_1.z
    .string({ required_error: "Email must not be empty." })
    .email({ message: "Invalid email format." });
exports.zNotificationType = zod_1.z.enum([
    "liking_post",
    "liking_comment",
    "comment",
    "follow",
    "replying_comment",
]);
exports.zGender = zod_1.z
    .any()
    .refine((arg) => arg === null || ["male", "female"].includes(arg), {
    message: "Invalid gender value, expected value: male, female, null",
});
exports.zBirthDate = zod_1.z.date();
exports.emailRequestValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: exports.zEmail,
    }),
});

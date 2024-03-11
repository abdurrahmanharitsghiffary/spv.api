"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postCommentValidationQuery = void 0;
const zod_1 = require("zod");
const _1 = require(".");
exports.postCommentValidationQuery = zod_1.z.object({
    limit: _1.zLimit,
    offset: _1.zOffset,
    order_by: zod_1.z
        .string()
        .refine((arg) => {
        const options = ["latest", "lowest", "highest", "oldest"];
        return (arg.split(",").every((arg) => {
            return options.includes(arg);
        }) ||
            arg === undefined ||
            arg === "");
    }, {
        message: "Invalid order_by options. Available options include: latest, oldest, highest, lowest. You can use multiple options by separating them with commas. For example: 'oldest,highest'.",
    })
        .refine((arg) => {
        const options = ["latest", "lowest", "highest", "oldest"];
        const str = arg.split(",");
        return options.every((e) => {
            return str.filter((s) => s === e).length < 2;
        });
    }, { message: "order_by options cannot be duplicated" })
        .transform((arg) => {
        const set = new Set();
        arg.split(",").forEach((arg) => {
            set.add(arg);
        });
        return Array.from(set);
    })
        .optional(),
});

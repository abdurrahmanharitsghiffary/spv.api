"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountsValidation = void 0;
const zod_1 = require("zod");
const count_controller_1 = require("../controllers/count.controller");
const countType = zod_1.z.any().refine((arg) => {
    if (arg === undefined)
        return true;
    const st = arg === null || arg === void 0 ? void 0 : arg.split(",");
    let isValid = true;
    st.forEach((type) => {
        if (!count_controller_1.defaultTypes.includes(type))
            isValid = false;
    });
    return isValid;
}, {
    message: `Invalid provided type query, expected ${count_controller_1.defaultTypes.join(", ")} or multiple combination with (,). correct example: 'liked_posts,unread_messages' or 'liked_posts'`,
});
exports.getCountsValidation = zod_1.z.object({
    query: zod_1.z.object({
        type: countType,
    }),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidationSignInSchema = exports.userValidationSignUpSchema = void 0;
const zod_1 = require("zod");
const _1 = require(".");
exports.userValidationSignUpSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: _1.zUsername,
        lastName: _1.zLastName,
        firstName: _1.zFirstName,
        password: (0, _1.zPassword)(),
        email: _1.zEmail,
        gender: _1.zGender.optional(),
        birthDate: _1.zBirthDate.optional(),
    }),
});
exports.userValidationSignInSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        email: _1.zEmail,
        password: (0, _1.zPassword)(),
        confirmPassword: (0, _1.zPassword)("confirmPassword"),
    })
        .refine((arg) => {
        if (arg.confirmPassword !== arg.password) {
            return false;
        }
        return true;
    }, {
        message: "The password and confirm password do not match.",
        path: ["confirmPassword"],
    }),
});

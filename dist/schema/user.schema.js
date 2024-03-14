"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.userValidationSignInSchema = exports.userValidationSignUpSchema = exports.validateConfirmPassword = void 0;
const zod_1 = require("zod");
const _1 = require(".");
const consts_1 = require("../lib/consts");
exports.validateConfirmPassword = {
    cb: (arg) => {
        if (arg.confirmPassword !== arg.password) {
            return false;
        }
        return true;
    },
    message: {
        message: consts_1.errorsMessage.FAILED_CONFIRMATION_MESSAGE,
        path: ["confirmPassword"],
    },
};
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
        .refine(exports.validateConfirmPassword.cb, exports.validateConfirmPassword.message),
});
exports.createUserSchema = zod_1.z
    .object({
    role: zod_1.z.enum(["user", "admin"]).optional(),
    username: _1.zUsername,
    lastName: _1.zLastName,
    firstName: _1.zFirstName,
    password: (0, _1.zPassword)(),
    confirmPassword: (0, _1.zPassword)("confirmPassword"),
    email: _1.zEmail,
    gender: _1.zGender.optional(),
    birthDate: _1.zBirthDate.optional(),
})
    .refine(exports.validateConfirmPassword.cb, exports.validateConfirmPassword.message);
exports.updateUserSchema = zod_1.z.object({
    role: zod_1.z.enum(["user", "admin"]).optional(),
    username: _1.zUsername.optional(),
    lastName: _1.zLastName.optional(),
    firstName: _1.zFirstName.optional(),
    gender: _1.zGender.optional(),
    birthDate: _1.zBirthDate.optional(),
    description: _1.zText.optional(),
});

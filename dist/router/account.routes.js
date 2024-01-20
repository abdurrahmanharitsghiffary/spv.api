"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resetPassword_controller_1 = require("../controllers/resetPassword.controller");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const schema_1 = require("../schema");
const account_controller_1 = require("../controllers/account.controller");
const limiter_middlewares_1 = require("../middlewares/limiter.middlewares");
const router = express_1.default.Router();
router
    .route("/resetpassword")
    .post(limiter_middlewares_1.resetPasswordLimiter, (0, validator_middlewares_1.validate)(schema_1.emailRequestValidation), (0, handler_middlewares_1.tryCatch)(resetPassword_controller_1.sendResetToken));
router.route("/resetpassword/:token").post((0, handler_middlewares_1.tryCatch)(resetPassword_controller_1.resetPassword));
router
    .route("/verify")
    .post(limiter_middlewares_1.verifyLimiter, (0, validator_middlewares_1.validate)(schema_1.emailRequestValidation), (0, handler_middlewares_1.tryCatch)(account_controller_1.sendVerifyToken));
router.route("/verify/:verifyToken").post((0, handler_middlewares_1.tryCatch)(account_controller_1.verifyAccount));
exports.default = router;

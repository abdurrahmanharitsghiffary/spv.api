"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const auth_controller_1 = require("../controllers/auth.controller");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const user_schema_1 = require("../schema/user.schema");
const limiter_middlewares_1 = require("../middlewares/limiter.middlewares");
const router = express_1.default.Router();
router
    .route("/login")
    .post(limiter_middlewares_1.loginLimiter, (0, validator_middlewares_1.validate)(user_schema_1.userValidationSignInSchema), (0, handler_middlewares_1.tryCatch)(auth_controller_1.login));
router
    .route("/signup")
    .post(limiter_middlewares_1.registerLimiter, (0, validator_middlewares_1.validate)(user_schema_1.userValidationSignUpSchema), (0, handler_middlewares_1.tryCatch)(auth_controller_1.signUp));
router.route("/logout").post((0, handler_middlewares_1.tryCatch)(auth_controller_1.signOut));
exports.default = router;

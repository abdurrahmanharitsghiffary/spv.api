"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const googleAuth_controller_1 = require("../controllers/googleAuth.controller");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const router = express_1.default.Router();
router
    .route("/")
    .get(passport_1.default.authenticate("google", {
    failureMessage: "Sign in failed",
    scope: ["profile", "email"],
    session: false,
}))
    .delete(auth_middlewares_1.verifyToken, (0, handler_middlewares_1.tryCatch)(googleAuth_controller_1.deleteGoogleAccount));
router.get("/callback", passport_1.default.authenticate("google", {
    failureMessage: "Sign in failed",
    session: false,
}), googleAuth_controller_1.googleAuthCallback);
exports.default = router;

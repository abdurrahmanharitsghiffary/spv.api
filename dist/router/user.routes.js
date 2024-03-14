"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const follow_controller_1 = require("../controllers/follow.controller");
const user_controller_2 = require("../controllers/user.controller");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const block_controller_1 = require("../controllers/block.controller");
const user_schema_1 = require("../schema/user.schema");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
const router = express_1.default.Router();
router.use(auth_middlewares_1.verifyToken);
const validateFExtended = (0, validator_middlewares_1.validate)(zod_1.z.object({
    params: zod_1.z.object({
        userId: schema_1.zIntOrStringId,
    }),
    query: zod_1.z.object({
        limit: schema_1.zLimit,
        offset: schema_1.zOffset,
    }),
}));
router
    .route("/")
    .get(auth_middlewares_1.isAdmin, validator_middlewares_1.validatePagingOptions, (0, handler_middlewares_1.tryCatch)(user_controller_1.getAllUsers))
    .post(auth_middlewares_1.isAdmin, multer_middlewares_1.uploadImageV2.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
]), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validateBody)(user_schema_1.createUserSchema), (0, handler_middlewares_1.tryCatch)(user_controller_1.createUser));
router
    .route("/blocked")
    .get(validator_middlewares_1.validatePagingOptions, (0, handler_middlewares_1.tryCatch)(block_controller_1.getAllBlockedUsers));
router
    .route("/:userId")
    .get((0, validator_middlewares_1.validateParamsV2)("userId"), (0, handler_middlewares_1.tryCatch)(user_controller_1.getUser))
    .patch(auth_middlewares_1.isAdmin, multer_middlewares_1.uploadImageV2.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
]), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validate)(zod_1.z.object({
    body: user_schema_1.updateUserSchema,
    params: zod_1.z.object({
        userId: schema_1.zIntOrStringId,
    }),
})), (0, handler_middlewares_1.tryCatch)(user_controller_1.updateUser))
    .delete(auth_middlewares_1.isAdmin, (0, validator_middlewares_1.validateParamsV2)("userId"), (0, handler_middlewares_1.tryCatch)(user_controller_1.deleteUser));
router
    .route("/:userId/following")
    .get(validateFExtended, (0, handler_middlewares_1.tryCatch)(follow_controller_1.getFollowedUsersById));
router
    .route("/:userId/followers")
    .get(validateFExtended, (0, handler_middlewares_1.tryCatch)(follow_controller_1.getUserFollowersById));
router
    .route("/:userId/followed")
    .get((0, validator_middlewares_1.validateParamsV2)("userId"), (0, handler_middlewares_1.tryCatch)(user_controller_1.getUserIsFollowed));
router.route("/:userId/posts").get((0, validator_middlewares_1.validate)(zod_1.z.object({
    params: zod_1.z.object({
        userId: schema_1.zIntOrStringId,
    }),
    query: zod_1.z.object({
        limit: schema_1.zLimit,
        offset: schema_1.zOffset,
    }),
})), (0, handler_middlewares_1.tryCatch)(user_controller_2.getPostByUserId));
exports.default = router;

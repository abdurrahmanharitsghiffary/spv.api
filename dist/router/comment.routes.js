"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const comment_middlewares_1 = require("../middlewares/comment.middlewares");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const commentLike_controller_1 = require("../controllers/commentLike.controller");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const zod_form_data_1 = require("zod-form-data");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
const router = express_1.default.Router();
router.use(auth_middlewares_1.verifyToken);
router.route("/").post(multer_middlewares_1.uploadImageV2.single("image"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validateBody)(zod_form_data_1.zfd.formData(zod_1.z.object({
    comment: zod_form_data_1.zfd.text(zod_1.z.string().optional()).optional(),
    postId: (0, schema_1.zfdInt)("postId"),
    parentId: (0, schema_1.zfdInt)("parentId").optional(),
    imageSrc: zod_form_data_1.zfd.text(zod_1.z.string().optional()).optional(),
}))), (0, handler_middlewares_1.tryCatch)(comment_controller_1.createComment));
router
    .route("/:commentId")
    .get((0, validator_middlewares_1.validateParamsV2)("commentId"), (0, handler_middlewares_1.tryCatch)(comment_controller_1.getComment))
    .post(multer_middlewares_1.uploadImageV2.single("image"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_form_data_1.zfd.formData(zod_1.z.object({
        comment: zod_form_data_1.zfd.text(zod_1.z.string().optional()).optional(),
        imageSrc: zod_form_data_1.zfd.text(zod_1.z.string().optional()).optional(),
    })),
    params: zod_1.z.object({
        commentId: schema_1.zIntOrStringId,
    }),
})), (0, handler_middlewares_1.tryCatch)(comment_controller_1.createReplyComment))
    .patch((0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_1.z.object({
        comment: schema_1.zText,
    }),
    params: zod_1.z.object({
        commentId: schema_1.zIntOrStringId,
    }),
})), (0, handler_middlewares_1.tryCatchMiddleware)(comment_middlewares_1.protectComment), (0, handler_middlewares_1.tryCatch)(comment_controller_1.updateComment))
    .delete((0, validator_middlewares_1.validateParamsV2)("commentId"), (0, handler_middlewares_1.tryCatchMiddleware)(comment_middlewares_1.protectComment), (0, handler_middlewares_1.tryCatch)(comment_controller_1.deleteComment));
router
    .route("/:commentId/likes")
    .get((0, validator_middlewares_1.validate)(zod_1.z.object({
    params: zod_1.z.object({
        commentId: schema_1.zIntOrStringId,
    }),
    query: zod_1.z.object({
        offset: schema_1.zOffset,
        limit: schema_1.zLimit,
    }),
})), (0, handler_middlewares_1.tryCatch)(commentLike_controller_1.getCommentLikesByCommentId))
    .post((0, validator_middlewares_1.validateParamsV2)("commentId"), (0, handler_middlewares_1.tryCatch)(commentLike_controller_1.createLike))
    .delete((0, validator_middlewares_1.validateParamsV2)("commentId"), (0, handler_middlewares_1.tryCatch)(commentLike_controller_1.deleteLike));
router
    .route("/:commentId/liked")
    .get((0, validator_middlewares_1.validateParamsV2)("commentId"), (0, handler_middlewares_1.tryCatch)(commentLike_controller_1.getCommentIsLiked));
exports.default = router;

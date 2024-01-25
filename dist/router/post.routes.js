"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const post_controller_1 = require("../controllers/post.controller");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const post_middlewares_1 = require("../middlewares/post.middlewares");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const postLike_controller_1 = require("../controllers/postLike.controller");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const comment_schema_1 = require("../schema/comment.schema");
const zod_form_data_1 = require("zod-form-data");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
const router = express_1.default.Router();
router.use(auth_middlewares_1.verifyToken);
router
    .route("/")
    .post(multer_middlewares_1.uploadImageV2.array("images[]"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validateBody)(zod_form_data_1.zfd.formData(zod_1.z.object({
    title: schema_1.zfdTitle,
    content: schema_1.zfdText,
}))), (0, handler_middlewares_1.tryCatch)(post_controller_1.createPost))
    .get(validator_middlewares_1.validatePagingOptions, auth_middlewares_1.isAdmin, (0, handler_middlewares_1.tryCatch)(post_controller_1.getAllPosts));
router
    .route("/following")
    .get(validator_middlewares_1.validatePagingOptions, (0, handler_middlewares_1.tryCatch)(post_controller_1.getFollowedUserPost));
router
    .route("/:postId")
    .get((0, validator_middlewares_1.validateParamsV2)("postId"), (0, handler_middlewares_1.tryCatch)(post_controller_1.getPost))
    .patch(multer_middlewares_1.uploadImageV2.array("images[]"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validate)(zod_1.z.object({
    body: zod_form_data_1.zfd.formData(zod_1.z.object({
        title: schema_1.zfdTitle,
        content: schema_1.zfdText,
    })),
    params: zod_1.z.object({
        postId: schema_1.zIntOrStringId,
    }),
})), (0, handler_middlewares_1.tryCatchMiddleware)(post_middlewares_1.protectPost), (0, handler_middlewares_1.tryCatch)(post_controller_1.updatePost))
    .delete((0, validator_middlewares_1.validateParamsV2)("postId"), (0, handler_middlewares_1.tryCatchMiddleware)(post_middlewares_1.protectPost), (0, handler_middlewares_1.tryCatch)(post_controller_1.deletePost));
router.route("/:postId/comments").get((0, validator_middlewares_1.validate)(zod_1.z.object({
    query: comment_schema_1.postCommentValidationQuery,
    params: zod_1.z.object({
        postId: schema_1.zIntOrStringId,
    }),
})), (0, handler_middlewares_1.tryCatch)(post_controller_1.getPostCommentsById));
router
    .route("/:postId/liked")
    .get((0, validator_middlewares_1.validateParamsV2)("postId"), (0, handler_middlewares_1.tryCatch)(postLike_controller_1.getPostIsLiked));
router
    .route("/:postId/likes")
    .get((0, validator_middlewares_1.validate)(zod_1.z.object({
    params: zod_1.z.object({
        postId: schema_1.zIntOrStringId,
    }),
    query: zod_1.z.object({
        limit: schema_1.zLimit,
        offset: schema_1.zOffset,
    }),
})), (0, handler_middlewares_1.tryCatch)(postLike_controller_1.getPostLikesByPostId))
    .post((0, validator_middlewares_1.validateParamsV2)("postId"), (0, handler_middlewares_1.tryCatch)(postLike_controller_1.createLike))
    .delete((0, validator_middlewares_1.validateParamsV2)("postId"), (0, handler_middlewares_1.tryCatch)(postLike_controller_1.deleteLike));
router
    .route("/:postId/images")
    .delete((0, validator_middlewares_1.validateParamsV2)("postId"), (0, handler_middlewares_1.tryCatchMiddleware)(post_middlewares_1.protectPost), (0, handler_middlewares_1.tryCatch)(post_controller_1.deletePostImagesByPostId));
router.route("/:postId/images/:imageId").delete((0, validator_middlewares_1.validate)(zod_1.z.object({
    params: zod_1.z.object({
        postId: schema_1.zIntOrStringId,
        imageId: schema_1.zIntOrStringId,
    }),
})), (0, handler_middlewares_1.tryCatchMiddleware)(post_middlewares_1.protectPost), (0, handler_middlewares_1.tryCatch)(post_controller_1.deletePostImageById));
exports.default = router;

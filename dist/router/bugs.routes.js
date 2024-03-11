"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const bugs_controller_1 = require("../controllers/bugs.controller");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
const router = express_1.default.Router();
router.use(auth_middlewares_1.verifyToken);
router.post("/", multer_middlewares_1.uploadImageV2.array("images"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validateBody)(zod_1.z.object({ description: zod_1.z.string() })), (0, handler_middlewares_1.tryCatch)(bugs_controller_1.reportBug));
router.use(auth_middlewares_1.isAdmin);
router.route("/").get(validator_middlewares_1.validatePagingOptions, (0, handler_middlewares_1.tryCatch)(bugs_controller_1.getAllBugs));
router
    .route("/:bugId")
    .patch((0, validator_middlewares_1.validateBody)(zod_1.z.object({ isResolved: zod_1.z.boolean(), description: zod_1.z.string() })), (0, handler_middlewares_1.tryCatch)(bugs_controller_1.updateBug))
    .delete((0, handler_middlewares_1.tryCatch)(bugs_controller_1.deleteBug));
exports.default = router;

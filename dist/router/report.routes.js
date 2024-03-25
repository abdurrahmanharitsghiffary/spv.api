"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handler_middlewares_1 = require("../middlewares/handler.middlewares");
const report_controller_1 = require("../controllers/report.controller");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const validator_middlewares_1 = require("../middlewares/validator.middlewares");
const zod_1 = require("zod");
const schema_1 = require("../schema");
const multer_middlewares_1 = require("../middlewares/multer.middlewares");
const cloudinary_middleware_1 = require("../middlewares/cloudinary.middleware");
const zod_form_data_1 = require("zod-form-data");
const router = express_1.default.Router();
router.use(auth_middlewares_1.verifyToken);
router.post("/", multer_middlewares_1.uploadImageV2.array("images[]"), cloudinary_middleware_1.uploadFilesToCloudinary, (0, validator_middlewares_1.validateBody)(zod_form_data_1.zfd.formData(zod_1.z.object({
    report: schema_1.zfdText,
    type: zod_form_data_1.zfd.text(zod_1.z.enum(["user", "group", "post", "comment", "message"])),
    id: (0, schema_1.zfdInt)("id"),
}))), (0, handler_middlewares_1.tryCatch)(report_controller_1.madeReport));
router.use(auth_middlewares_1.isAdmin);
router.route("/").get(validator_middlewares_1.validatePagingOptions, (0, validator_middlewares_1.validate)(zod_1.z.object({
    query: zod_1.z.object({
        type: zod_1.z
            .enum(["user", "post", "comment", "group", "message", "all"])
            .optional(),
    }),
})), (0, handler_middlewares_1.tryCatch)(report_controller_1.getReport));
router
    .route("/:reportId")
    .delete((0, validator_middlewares_1.validateParamsV2)("reportId"), (0, handler_middlewares_1.tryCatch)(report_controller_1.deleteReport));
exports.default = router;

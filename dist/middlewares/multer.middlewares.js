"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const error_1 = require("../lib/error");
const consts_1 = require("../lib/consts");
const fileType = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 300000;
const storage = multer_1.default.diskStorage({
    destination(req, file, callback) {
        callback(null, "src/public/assets/uploads");
    },
    filename(req, file, callback) {
        const typeImage = req.url.includes("comments")
            ? "COMMENT"
            : req.url.includes("posts")
                ? "POST"
                : "";
        callback(null, `${Date.now().toString()}-${typeImage ? `${typeImage}-` : ""}${file.originalname}`);
    },
});
exports.uploadImage = (0, multer_1.default)({
    limits: { fileSize: MAX_FILE_SIZE },
    storage,
    fileFilter(req, file, callback) {
        if (fileType.includes(file.mimetype)) {
            callback(null, true);
        }
        else if (!fileType.includes(file.mimetype)) {
            callback(new error_1.RequestError(consts_1.errorsMessage.FILE_MIME_TYPE, 415));
        }
        else {
            callback(null, false);
        }
    },
});

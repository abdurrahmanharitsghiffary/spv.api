"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFileToBase64 = exports.uploadFilesToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../lib/cloudinary"));
const handler_middlewares_1 = require("./handler.middlewares");
exports.uploadFilesToCloudinary = (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const file = req.file;
    const uploadedImageUrls = [];
    const uploadedFiles = [...Array.from(files)];
    if (file !== undefined && file instanceof File) {
        uploadedFiles.push(file);
    }
    yield Promise.all(uploadedFiles.map((image) => __awaiter(void 0, void 0, void 0, function* () {
        const base64 = yield (0, exports.convertFileToBase64)(image);
        const uploadedFile = yield cloudinary_1.default.uploader.upload(base64, {
            resource_type: "auto",
            public_id: `${image.originalname.split("." + image.mimetype.split("/")[1])[0]}-${Date.now()}`,
        });
        uploadedImageUrls.push(uploadedFile.secure_url);
    })));
    req.uploadedImageUrls = uploadedImageUrls;
    return next();
}));
const convertFileToBase64 = (file) => new Promise((resolve) => {
    {
        const base64 = Buffer.from(file.buffer).toString("base64");
        const dataUri = "data:" + file.mimetype + ";base64," + base64;
        resolve(dataUri);
    }
});
exports.convertFileToBase64 = convertFileToBase64;

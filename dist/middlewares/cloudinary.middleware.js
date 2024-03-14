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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFilesToCloudinary = void 0;
const handler_middlewares_1 = require("./handler.middlewares");
const utils_1 = require("../utils");
exports.uploadFilesToCloudinary = (0, handler_middlewares_1.tryCatchMiddleware)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const files = req.files;
    const file = req.file;
    const uploadedImageUrls = [];
    const uploadedFiles = [];
    if (files !== undefined && files instanceof Array) {
        uploadedFiles.push(...Array.from((_a = files) !== null && _a !== void 0 ? _a : []));
    }
    if (file !== undefined) {
        uploadedFiles.push(file);
    }
    if (typeof files === "object") {
        uploadedFiles.push(...Object.values(files));
    }
    yield Promise.all(uploadedFiles.map((image) => __awaiter(void 0, void 0, void 0, function* () {
        const uploadedFile = yield (0, utils_1.cloudinaryUpload)(image);
        uploadedImageUrls.push(typeof files === "object"
            ? { fieldName: image.fieldname, src: uploadedFile.secure_url }
            : uploadedFile.secure_url);
    })));
    req.uploadedImageUrls = uploadedImageUrls;
    return next();
}));

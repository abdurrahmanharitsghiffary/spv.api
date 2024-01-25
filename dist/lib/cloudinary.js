"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudinaryImage = void 0;
const cloudinary_1 = require("cloudinary");
const getCloudinaryImage = (req) => {
    var _a;
    return (_a = req === null || req === void 0 ? void 0 : req.uploadedImageUrls) !== null && _a !== void 0 ? _a : [];
};
exports.getCloudinaryImage = getCloudinaryImage;
exports.default = cloudinary_1.v2;

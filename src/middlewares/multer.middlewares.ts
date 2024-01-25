import express from "express";
import multer, { FileFilterCallback } from "multer";
import { RequestError } from "../lib/error";
import { errorsMessage } from "../lib/consts";

const fileType = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 300000;

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "src/public/assets/uploads");
  },
  filename(req, file, callback) {
    const typeImage = req.url.includes("comments")
      ? "COMMENT"
      : req.url.includes("posts")
      ? "POST"
      : "";

    callback(
      null,
      `${Date.now().toString()}-${typeImage ? `${typeImage}-` : ""}${
        file.originalname
      }`
    );
  },
});

const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  if (fileType.includes(file.mimetype)) {
    callback(null, true);
  } else if (!fileType.includes(file.mimetype)) {
    callback(new RequestError(errorsMessage.FILE_MIME_TYPE, 415));
  } else {
    callback(null, false);
  }
};

export const uploadImage = multer({
  limits: { fileSize: MAX_FILE_SIZE },
  storage,
  fileFilter,
});

export const uploadImageV2 = multer({
  limits: { fileSize: MAX_FILE_SIZE },
  storage: multer.memoryStorage(),
  fileFilter,
});

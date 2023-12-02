import multer from "multer";
import { RequestError } from "../lib/error";

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

export const uploadImage = multer({
  storage,
  fileFilter(req, file, callback) {
    const fileSize = Number(req.headers["content-length"]);
    console.log(fileSize, " fileSize");
    if (fileType.includes(file.mimetype) && fileSize <= MAX_FILE_SIZE) {
      callback(null, true);
    } else if (!fileType.includes(file.mimetype)) {
      callback(
        new RequestError(
          "Invalid file mime types, accepted types: .jpg, .jpeg, .png, .webp",
          415
        )
      );
    } else if (fileSize >= MAX_FILE_SIZE) {
      callback(
        new RequestError(
          "The file size exceeds the maximum allowed limit. Please upload a file that is equals to 300kb or fewer.",
          413
        )
      );
    } else {
      callback(null, false);
    }
  },
});

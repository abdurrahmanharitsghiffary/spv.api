import multer from "multer";

const fileType = ["image/jpeg", "image/png", "image/jpg"];

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "src/public/assets/uploads");
  },
  filename(req, file, callback) {
    callback(null, `${Date.now().toString()}-${file.originalname}`);
  },
});

export const uploadImage = multer({
  storage,
  fileFilter(req, file, callback) {
    if (fileType.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
});

import express from "express";
import { isAdmin, verifyToken } from "../middlewares/auth.middlewares";
import { tryCatch } from "../middlewares/handler.middlewares";
import {
  deleteBug,
  getAllBugs,
  updateBug,
  reportBug,
} from "../controllers/bugs.controller";
import {
  validateBody,
  validatePagingOptions,
} from "../middlewares/validator.middlewares";
import { z } from "zod";
import { uploadImageV2 } from "../middlewares/multer.middlewares";
import { uploadFilesToCloudinary } from "../middlewares/cloudinary.middleware";
import { zfdText } from "../schema";
import { zfd } from "zod-form-data";

const router = express.Router();

router.use(verifyToken);

router.post(
  "/",
  uploadImageV2.array("images[]"),
  uploadFilesToCloudinary,
  validateBody(zfd.formData(z.object({ description: zfdText }))),
  tryCatch(reportBug)
);

router.use(isAdmin);

router.route("/").get(validatePagingOptions, tryCatch(getAllBugs));

router
  .route("/:bugId")
  .patch(
    validateBody(
      z.object({ isResolved: z.boolean(), description: z.string() })
    ),
    tryCatch(updateBug)
  )
  .delete(tryCatch(deleteBug));

export default router;

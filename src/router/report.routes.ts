import express from "express";
import { tryCatch } from "../middlewares/handler.middlewares";
import {
  deleteReport,
  getReport,
  madeReport,
} from "../controllers/report.controller";
import { isAdmin, verifyToken } from "../middlewares/auth.middlewares";
import {
  validate,
  validateBody,
  validatePagingOptions,
  validateParamsV2,
} from "../middlewares/validator.middlewares";
import { z } from "zod";
import { zfdInt, zfdText } from "../schema";
import { uploadImageV2 } from "../middlewares/multer.middlewares";
import { uploadFilesToCloudinary } from "../middlewares/cloudinary.middleware";
import { zfd } from "zod-form-data";

const router = express.Router();

router.use(verifyToken);

router.post(
  "/",
  uploadImageV2.array("images[]"),
  uploadFilesToCloudinary,
  validateBody(
    zfd.formData(
      z.object({
        report: zfdText,
        type: zfd.text(z.enum(["user", "group", "post", "comment", "message"])),
        id: zfdInt("id"),
      })
    )
  ),
  tryCatch(madeReport)
);

router.use(isAdmin);

router.route("/").get(
  validatePagingOptions,
  validate(
    z.object({
      query: z.object({
        type: z
          .enum(["user", "post", "comment", "group", "message", "all"])
          .optional(),
      }),
    })
  ),
  tryCatch(getReport)
);

router
  .route("/:reportId")
  .delete(validateParamsV2("reportId"), tryCatch(deleteReport));

export default router;

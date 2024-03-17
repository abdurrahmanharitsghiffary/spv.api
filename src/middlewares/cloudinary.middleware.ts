import express from "express";
import { tryCatchMiddleware } from "./handler.middlewares";
import { cloudinaryUpload } from "../utils";
import { UploadedImageUrls } from "../types/request";

export const uploadFilesToCloudinary = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const files = req.files;
    const file = req.file;
    const isObject =
      typeof files === "object" && files instanceof Array === false;
    const uploadedImageUrls: UploadedImageUrls = [];
    const uploadedFiles: Express.Multer.File[] = [];
    if (files !== undefined && files instanceof Array) {
      uploadedFiles.push(...Array.from((files as Express.Multer.File[]) ?? []));
    }
    if (file !== undefined) {
      uploadedFiles.push(file);
    }
    console.log(files instanceof Array, "Is Array");
    console.log(files, "Fillessss");
    if (isObject) {
      // @ts-ignore
      uploadedFiles.push(...Object.values(files));
    }

    await Promise.all(
      uploadedFiles.map(async (image: Express.Multer.File) => {
        const uploadedFile = await cloudinaryUpload(image);
        (uploadedImageUrls as any).push(
          isObject
            ? { fieldName: image.fieldname, src: uploadedFile.secure_url }
            : uploadedFile.secure_url
        );
      })
    );

    (req as any).uploadedImageUrls = uploadedImageUrls;
    return next();
  }
);

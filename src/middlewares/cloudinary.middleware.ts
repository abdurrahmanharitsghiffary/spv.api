import express from "express";
import cloudinary from "../lib/cloudinary";
import { tryCatchMiddleware } from "./handler.middlewares";
export const uploadFilesToCloudinary = tryCatchMiddleware(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const files = req.files;
    const file = req.file;
    const uploadedImageUrls: string[] = [];
    const uploadedFiles = [...Array.from(files as any[])];
    if (file !== undefined && file instanceof File) {
      uploadedFiles.push(file);
    }

    await Promise.all(
      uploadedFiles.map(async (image: Express.Multer.File) => {
        const base64 = await convertFileToBase64(image);
        const uploadedFile = await cloudinary.uploader.upload(base64, {
          resource_type: "auto",
          public_id: `${
            image.originalname.split("." + image.mimetype.split("/")[1])[0]
          }-${Date.now()}`,
        });
        uploadedImageUrls.push(uploadedFile.secure_url);
      })
    );

    (req as any).uploadedImageUrls = uploadedImageUrls;
    return next();
  }
);

export const convertFileToBase64 = (
  file: Express.Multer.File
): Promise<string> =>
  new Promise((resolve) => {
    {
      const base64 = Buffer.from(file.buffer).toString("base64");
      const dataUri = "data:" + file.mimetype + ";base64," + base64;
      resolve(dataUri);
    }
  });

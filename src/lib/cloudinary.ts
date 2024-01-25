import { v2 as cloudinary } from "cloudinary";
import { ExpressRequestCloudinary } from "../types/request";

export const getCloudinaryImage = (req: ExpressRequestCloudinary) => {
  return req?.uploadedImageUrls ?? [];
};

export default cloudinary;

import { $Enums } from "@prisma/client";
import express from "express";

export type ExpressRequest = express.Request;
export type ExpressResponse = express.Response;

export interface AuthorizeRequest extends express.Request {
  userEmail: string;
}

export type ExpressRequestExtended = express.Request & {
  userEmail: string;
  userId: string;
  role: "admin" | "user";
};

export type ExpressRequestProtectedGroup = express.Request & {
  userRole: $Enums.ParticipantRole;
};

export type UploadedImageUrls = string[] | { fieldName: string; src: string }[];

export type UploadedCloudinaryFile = {
  uploadedImageUrls?: UploadedImageUrls;
};

export type ExpressRequestCloudinary = express.Request & UploadedCloudinaryFile;

import fs from "fs/promises";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import {
  ACCESS_TOKEN_SECRET,
  BASE_URL,
  REFRESH_TOKEN_SECRET,
} from "../lib/consts";
export const deleteUploadedImage = async (src: string) => {
  const path = src.split("public/")[1];
  try {
    await fs.unlink("src/public/" + path);
  } catch (err: any) {
    throw new Error(err);
  }
};

export const generateRefreshToken = async (payload: string | object | Buffer) =>
  await JWT.sign(payload, REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });

export const generateAccessToken = async (payload: string | object | Buffer) =>
  await JWT.sign(payload, ACCESS_TOKEN_SECRET as string, {
    expiresIn: 3600,
    // expiresIn: 1,
  });

export const getFileDest = (file: Express.Multer.File | undefined) => {
  if (!file) return null;
  return file?.destination.replace("src", "") + `/${file?.filename}`;
};

export const getCompleteFileUrlPath = (
  profile: { src: string; id?: number } | null | undefined
) => {
  if (!profile) return null;
  try {
    const url = new URL(profile.src, BASE_URL);
    return { ...profile, src: url.href };
  } catch (err) {
    return null;
  }
};

export const getRandomToken = (): Promise<string> => {
  return new Promise((resolve) =>
    resolve(crypto.randomBytes(32).toString("hex"))
  );
};

export const isNullUndefined = (data: any) => {
  return data === null || data === undefined;
};

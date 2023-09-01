import { baseUrl } from "../lib/baseUrl";

export const getFileDest = (file: Express.Multer.File | undefined) => {
  if (!file) return null;
  return (
    file?.destination.replace("src", baseUrl as string) + `/${file?.filename}`
  );
};

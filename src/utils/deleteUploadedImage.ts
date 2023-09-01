import fs from "fs/promises";
export const deleteUploadedImage = async (src: string) => {
  const path = src.split("public/")[1];
  try {
    await fs.unlink("src/public/" + path);
  } catch (err: any) {
    throw new Error(err);
  }
};

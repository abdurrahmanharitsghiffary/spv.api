export const getFileDest = (file: Express.Multer.File | undefined) => {
  if (!file) return null;
  return file?.destination.replace("src", "") + `/${file?.filename}`;
};
